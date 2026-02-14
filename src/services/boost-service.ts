'use server';

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { BoostSettings, BoostWithdrawal } from '@/lib/types';

const BOOST_SETTINGS_DOC_ID = 'default';

const DEFAULT_BOOST_SETTINGS: BoostSettings = {
  boostEnabled: true,
  boostPercentage: 2,
  applyOn: 'gross',
  minRedemptionThreshold: 555,
  autoApproveThreshold: 0,
};

/**
 * Fetches Merchant Boost settings from Firestore. Returns defaults if not configured.
 */
export async function getBoostSettings(): Promise<BoostSettings> {
  if (!isFirebaseConfigured) return DEFAULT_BOOST_SETTINGS;
  const ref = doc(db, 'boostSettings', BOOST_SETTINGS_DOC_ID);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAt = data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined;
      return {
        boostEnabled: typeof data?.boostEnabled === 'boolean' ? data.boostEnabled : DEFAULT_BOOST_SETTINGS.boostEnabled,
        boostPercentage: typeof data?.boostPercentage === 'number' ? Math.max(0, Math.min(100, data.boostPercentage)) : DEFAULT_BOOST_SETTINGS.boostPercentage,
        applyOn: data?.applyOn === 'final' ? 'final' : 'gross',
        minRedemptionThreshold: typeof data?.minRedemptionThreshold === 'number' ? Math.max(0, data.minRedemptionThreshold) : DEFAULT_BOOST_SETTINGS.minRedemptionThreshold,
        autoApproveThreshold: typeof data?.autoApproveThreshold === 'number' ? Math.max(0, data.autoApproveThreshold) : DEFAULT_BOOST_SETTINGS.autoApproveThreshold,
        updatedAt,
      };
    }
  } catch (e) {
    console.error('Error fetching boost settings:', e);
  }
  return DEFAULT_BOOST_SETTINGS;
}

/**
 * Saves Merchant Boost settings to Firestore.
 */
export async function updateBoostSettings(settings: BoostSettings): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'boostSettings', BOOST_SETTINGS_DOC_ID);
  await setDoc(ref, {
    boostEnabled: settings.boostEnabled,
    boostPercentage: Math.max(0, Math.min(100, settings.boostPercentage)),
    applyOn: settings.applyOn === 'final' ? 'final' : 'gross',
    minRedemptionThreshold: Math.max(0, settings.minRedemptionThreshold),
    autoApproveThreshold: Math.max(0, settings.autoApproveThreshold),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Credits a merchant's Boost balance for a purchase. Called after a purchase transaction is recorded.
 * Uses amountPaise as the eligible amount (for "final" we use it; for "gross" pass grossAmountPaise if available).
 * @param merchantId - Merchant to credit
 * @param amountPaise - Amount in paise (final paid amount, or gross if applyOn is gross and no separate gross)
 * @param options.grossAmountPaise - If applyOn is 'gross' and you have pre-discount amount, pass it here
 * @param options.sourceTransactionId - Purchase transaction id for audit
 */
export async function creditBoostForPurchase(
  merchantId: string,
  amountPaise: number,
  options?: { grossAmountPaise?: number; sourceTransactionId?: string }
): Promise<{ credited: number }> {
  if (!isFirebaseConfigured || amountPaise <= 0) return { credited: 0 };
  const settings = await getBoostSettings();
  if (!settings.boostEnabled || settings.boostPercentage <= 0) return { credited: 0 };

  const eligiblePaise =
    settings.applyOn === 'gross' && options?.grossAmountPaise != null && options.grossAmountPaise > 0
      ? options.grossAmountPaise
      : amountPaise;
  const boostRupees = (eligiblePaise / 100) * (settings.boostPercentage / 100);
  if (boostRupees <= 0) return { credited: 0 };

  const merchantRef = doc(db, 'merchants', merchantId);
  const boostTransactionsCol = collection(db, 'boostTransactions');

  try {
    await runTransaction(db, async (tx) => {
      const merchantSnap = await tx.get(merchantRef);
      if (!merchantSnap.exists()) throw new Error('Merchant not found');
      const data = merchantSnap.data();
      const currentBalance = Number(data?.boostBalance ?? 0) || 0;
      const currentTotal = Number(data?.totalBoostEarned ?? 0) || 0;
      tx.update(merchantRef, {
        boostBalance: currentBalance + boostRupees,
        totalBoostEarned: currentTotal + boostRupees,
      });
      const ref = doc(boostTransactionsCol);
      tx.set(ref, {
        merchantId,
        amount: boostRupees,
        type: 'credit',
        sourceId: options?.sourceTransactionId ?? null,
        createdAt: Timestamp.now(),
      });
    });
  } catch (e) {
    console.error('creditBoostForPurchase error:', e);
    return { credited: 0 };
  }
  return { credited: boostRupees };
}

/**
 * Creates a Boost withdrawal request for the merchant. Debits boostBalance immediately.
 * Fails if balance < minRedemptionThreshold or merchant not found.
 */
export async function createBoostWithdrawalRequest(merchantId: string): Promise<
  { success: true; withdrawalId: string } | { success: false; error: string }
> {
  if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' };
  const settings = await getBoostSettings();
  const merchantRef = doc(db, 'merchants', merchantId);
  const boostWithdrawalsCol = collection(db, 'boostWithdrawals');
  const boostTransactionsCol = collection(db, 'boostTransactions');

  try {
    let withdrawalId: string;
    await runTransaction(db, async (tx) => {
      const merchantSnap = await tx.get(merchantRef);
      if (!merchantSnap.exists()) throw new Error('Merchant not found');
      const data = merchantSnap.data();
      const balance = Number(data?.boostBalance ?? 0) || 0;
      if (balance < settings.minRedemptionThreshold) {
        throw new Error(`Balance ₹${balance.toFixed(2)} is below minimum withdrawal threshold ₹${settings.minRedemptionThreshold}.`);
      }
      const amount = balance;
      const now = Timestamp.now();
      const status = settings.autoApproveThreshold > 0 && amount <= settings.autoApproveThreshold ? 'completed' : 'pending';
      const withdrawalRef = doc(boostWithdrawalsCol);
      withdrawalId = withdrawalRef.id;
      tx.set(withdrawalRef, {
        merchantId,
        amount,
        status,
        createdAt: now,
        ...(status === 'completed' ? { reviewedAt: now, note: 'Auto-approved' } : {}),
      });
      tx.update(merchantRef, { boostBalance: 0 });
      const txRef = doc(boostTransactionsCol);
      tx.set(txRef, {
        merchantId,
        amount: -amount,
        type: 'withdrawal',
        sourceId: withdrawalRef.id,
        createdAt: now,
      });
    });
    return { success: true, withdrawalId: withdrawalId! };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Withdrawal request failed';
    return { success: false, error: message };
  }
}

/**
 * Lists Boost withdrawal requests. Defaults to pending first, then by createdAt desc.
 */
export async function listBoostWithdrawals(limitVal: number = 100): Promise<BoostWithdrawal[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'boostWithdrawals');
  const q = query(col, orderBy('createdAt', 'desc'), limit(limitVal));
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        merchantId: data.merchantId ?? '',
        amount: Number(data.amount) || 0,
        status: data.status === 'rejected' ? 'rejected' : data.status === 'completed' ? 'completed' : 'pending',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate() : undefined,
        reviewedBy: data.reviewedBy,
        note: data.note,
      } as BoostWithdrawal;
    });
  } catch (e) {
    console.error('listBoostWithdrawals error:', e);
    return [];
  }
}

/**
 * Updates a Boost withdrawal's status (admin approve/reject). On reject, credits amount back to merchant.
 */
export async function updateBoostWithdrawalStatus(
  withdrawalId: string,
  status: 'completed' | 'rejected',
  options?: { reviewedBy?: string; note?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' };
  const ref = doc(db, 'boostWithdrawals', withdrawalId);
  const boostTransactionsCol = collection(db, 'boostTransactions');

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Withdrawal not found.' };
    const data = snap.data();
    const currentStatus = data?.status;
    if (currentStatus !== 'pending') {
      return { success: false, error: `Withdrawal is already ${currentStatus}.` };
    }
    const merchantId = data.merchantId as string;
    const amount = Number(data.amount) || 0;
    const actualMerchantRef = doc(db, 'merchants', merchantId);
    const now = Timestamp.now();

    if (status === 'rejected') {
      await runTransaction(db, async (tx) => {
        const merchantSnap = await tx.get(actualMerchantRef);
        const currentBalance = merchantSnap.exists() ? Number(merchantSnap.data()?.boostBalance ?? 0) || 0 : 0;
        tx.update(ref, {
          status: 'rejected',
          reviewedAt: now,
          reviewedBy: options?.reviewedBy ?? null,
          note: options?.note ?? null,
        });
        tx.update(actualMerchantRef, { boostBalance: currentBalance + amount });
        const txRef = doc(boostTransactionsCol);
        tx.set(txRef, {
          merchantId,
          amount,
          type: 'credit',
          sourceId: withdrawalId,
          createdAt: now,
          description: 'Refund (withdrawal rejected)',
        });
      });
    } else {
      await runTransaction(db, async (tx) => {
        tx.update(ref, {
          status: 'completed',
          reviewedAt: now,
          reviewedBy: options?.reviewedBy ?? null,
          note: options?.note ?? null,
        });
      });
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed';
    return { success: false, error: message };
  }
}

/**
 * Fetches Boost transaction history for a merchant (credits and withdrawals).
 */
export async function getBoostTransactionsForMerchant(
  merchantId: string,
  limitVal: number = 50
): Promise<Array<{ id: string; amount: number; type: 'credit' | 'withdrawal'; sourceId?: string; createdAt: Date }>> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'boostTransactions');
  const q = query(
    col,
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc'),
    limit(limitVal)
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        amount: Number(data.amount) || 0,
        type: data.type === 'withdrawal' ? 'withdrawal' : 'credit',
        sourceId: data.sourceId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      };
    });
  } catch (e) {
    console.error('getBoostTransactionsForMerchant error:', e);
    return [];
  }
}
