'use server';

import {
  doc,
  collection,
  runTransaction,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { getOfferById } from './offer-service';
import { getCommissionSettings } from './commission-service';
import { getUserById } from './user-service';
import { createTransaction } from './transaction-service';
import { getMerchantById } from './merchant-service';
import { getSlabPointsForPurchase } from './loyalty-slab-service';
import { getSlabCategoryKey } from '@/lib/loyalty-slabs';
import { creditBoostForPurchase } from './boost-service';

const DEFAULT_LOYALTY_POINTS_PER_OFFER = 10;

export type RecordPurchaseParams = {
  userId: string;
  offerId: string;
  merchantId?: string;
  quantity: number;
  totalAmountPaise: number;
};

/** Params for recording a purchase from a payment gateway (e.g. PhonePe webhook). offerId/quantity optional for generic in-store bill. */
export type RecordPurchaseFromGatewayParams = {
  userId: string;
  merchantId: string;
  totalAmountPaise: number;
  offerId?: string;
  quantity?: number;
};

export type AllocatePointsResult = {
  success: boolean;
  purchaseTransactionId?: string;
  buyerPoints?: number;
  parentPoints?: number;
  grandparentPoints?: number;
  error?: string;
};

/**
 * Records a purchase from a verified payment gateway (e.g. PhonePe webhook). Uses gateway amount.
 * If offerId and quantity are provided and offer exists, allocates loyalty points; otherwise only creates purchase transaction.
 */
export async function recordPurchaseFromGateway(
  params: RecordPurchaseFromGatewayParams
): Promise<AllocatePointsResult> {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not configured.' };
  }
  const { userId, merchantId, totalAmountPaise, offerId, quantity } = params;
  if (totalAmountPaise < 0) {
    return { success: false, error: 'Invalid amount.' };
  }

  if (offerId != null && quantity != null && quantity >= 1) {
    const offer = await getOfferById(offerId);
    if (offer) {
      return recordPurchase({
        userId,
        offerId,
        merchantId,
        quantity,
        totalAmountPaise,
      });
    }
  }

  const purchaseId = await createTransaction({
    userId,
    amount: totalAmountPaise,
    type: 'purchase',
    merchantId,
    description: 'In-store payment (PhonePe)',
  });
  if (merchantId) {
    await creditBoostForPurchase(merchantId, totalAmountPaise, { sourceTransactionId: purchaseId });
  }
  return {
    success: true,
    purchaseTransactionId: purchaseId,
    buyerPoints: 0,
    parentPoints: 0,
    grandparentPoints: 0,
  };
}

/**
 * Records a purchase and allocates loyalty points. Points can be slab-based (by order value + category/industry) or per-offer.
 * Split: Parent (L1) : Buyer : Grandparent (L2) as configured (e.g. 70:20:10). Not MLM; referral rewards only.
 */
export async function recordPurchase(
  params: RecordPurchaseParams
): Promise<AllocatePointsResult> {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not configured.' };
  }
  const { userId, offerId, merchantId, quantity, totalAmountPaise } = params;
  if (quantity < 1 || totalAmountPaise < 0) {
    return { success: false, error: 'Invalid quantity or amount.' };
  }

  const offer = await getOfferById(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found.' };
  }

  let totalPoints: number;
  const merchant = merchantId ? await getMerchantById(merchantId) : null;
  const categoryKey = getSlabCategoryKey(merchant?.industry, merchant?.category);
  const slabPoints = await getSlabPointsForPurchase(totalAmountPaise, categoryKey);
  if (slabPoints !== null) {
    totalPoints = slabPoints;
  } else {
    const pointsPerUnit = offer.loyalty_points ?? DEFAULT_LOYALTY_POINTS_PER_OFFER;
    totalPoints = Math.floor(pointsPerUnit * quantity);
  }

  if (totalPoints <= 0) {
    // Still record the purchase, just no points
    const purchaseId = await createTransaction({
      userId,
      amount: totalAmountPaise,
      type: 'purchase',
      merchantId: merchantId ?? undefined,
      offerId,
      quantity,
      description: `Purchase: ${offer.title} x${quantity}`,
    });
    if (merchantId) {
      await creditBoostForPurchase(merchantId, totalAmountPaise, { sourceTransactionId: purchaseId });
    }
    return {
      success: true,
      purchaseTransactionId: purchaseId,
      buyerPoints: 0,
      parentPoints: 0,
      grandparentPoints: 0,
    };
  }

  const purchaseId = await createTransaction({
    userId,
    amount: totalAmountPaise,
    type: 'purchase',
    merchantId: merchantId ?? undefined,
    offerId,
    quantity,
    description: `Purchase: ${offer.title} x${quantity}`,
  });
  if (merchantId) {
    await creditBoostForPurchase(merchantId, totalAmountPaise, { sourceTransactionId: purchaseId });
  }

  const alloc = await allocatePointsOnPurchase({
    buyerId: userId,
    purchaseTransactionId: purchaseId,
    offerId,
    quantity,
    totalPoints,
  });

  if (!alloc.success) {
    return { ...alloc, purchaseTransactionId: purchaseId };
  }
  return {
    success: true,
    purchaseTransactionId: purchaseId,
    buyerPoints: alloc.buyerPoints,
    parentPoints: alloc.parentPoints,
    grandparentPoints: alloc.grandparentPoints,
  };
}

/**
 * Allocates points from a purchase: Buyer (child), Parent (L1 referrer), Grandparent (L2 referrer).
 * Ratio from CommissionSettings (e.g. 70:20:10). Prevents self-referral. Rounds down.
 */
export async function allocatePointsOnPurchase(params: {
  buyerId: string;
  purchaseTransactionId: string;
  offerId: string;
  quantity: number;
  totalPoints: number;
}): Promise<AllocatePointsResult> {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is not configured.' };
  }
  const {
    buyerId,
    purchaseTransactionId,
    offerId,
    quantity,
    totalPoints,
  } = params;
  if (totalPoints <= 0) {
    return { success: true, buyerPoints: 0, parentPoints: 0, grandparentPoints: 0 };
  }

  const buyer = await getUserById(buyerId);
  if (!buyer) {
    return { success: false, error: 'Buyer not found.' };
  }

  const settings = await getCommissionSettings();
  let pctBuyer = Math.min(100, Math.max(0, settings.loyaltyPointsSharePctBuyer ?? 20));
  let pctParent = Math.min(100, Math.max(0, settings.loyaltyPointsSharePctParent ?? 70));
  let pctGrandparent = Math.min(100, Math.max(0, settings.loyaltyPointsSharePctGrandparent ?? 10));
  const sum = pctBuyer + pctParent + pctGrandparent;
  if (sum > 0) {
    pctBuyer = (pctBuyer / sum) * 100;
    pctParent = (pctParent / sum) * 100;
    pctGrandparent = (pctGrandparent / sum) * 100;
  }

  let parentId: string | null = null;
  let grandparentId: string | null = null;
  if (buyer.referredBy && buyer.referredBy.trim() !== '' && buyer.referredBy !== buyerId) {
    const parent = await getUserById(buyer.referredBy);
    const resolvedParentId = parent?.uid ?? buyer.referredBy;
    if (parent && resolvedParentId !== buyerId) {
      parentId = resolvedParentId;
      if (parent.referredBy && parent.referredBy.trim() !== '' && parent.referredBy !== buyerId && parent.referredBy !== parentId) {
        const grandparent = await getUserById(parent.referredBy);
        if (grandparent && grandparent.uid !== buyerId && grandparent.uid !== parentId) {
          grandparentId = grandparent.uid;
        }
      }
    }
  }

  let buyerPoints = Math.floor(totalPoints * (pctBuyer / 100));
  let parentPoints = parentId ? Math.floor(totalPoints * (pctParent / 100)) : 0;
  let grandparentPoints = grandparentId ? Math.floor(totalPoints * (pctGrandparent / 100)) : 0;
  if (!parentId) {
    buyerPoints += parentPoints + grandparentPoints;
    parentPoints = 0;
    grandparentPoints = 0;
  } else if (!grandparentId) {
    buyerPoints += grandparentPoints;
    grandparentPoints = 0;
  }

  const buyerRef = doc(db, 'users', buyerId);
  const parentRef = parentId ? doc(db, 'users', parentId) : null;
  const grandparentRef = grandparentId ? doc(db, 'users', grandparentId) : null;
  const transactionsCol = collection(db, 'transactions');

  try {
    await runTransaction(db, async (tx) => {
      const buyerSnap = await tx.get(buyerRef);
      if (!buyerSnap.exists()) throw new Error('Buyer not found');
      const buyerData = buyerSnap.data();
      const currentBuyerPoints = Number(buyerData?.pointsBalance ?? 0) || 0;
      tx.update(buyerRef, {
        pointsBalance: currentBuyerPoints + buyerPoints,
        updatedAt: Timestamp.now(),
      });

      if (parentRef && parentPoints > 0) {
        const parentSnap = await tx.get(parentRef);
        if (parentSnap.exists()) {
          const parentData = parentSnap.data();
          const currentParentPoints = Number(parentData?.pointsBalance ?? 0) || 0;
          tx.update(parentRef, {
            pointsBalance: currentParentPoints + parentPoints,
            updatedAt: Timestamp.now(),
          });
        }
      }
      if (grandparentRef && grandparentPoints > 0) {
        const gpSnap = await tx.get(grandparentRef);
        if (gpSnap.exists()) {
          const gpData = gpSnap.data();
          const currentGpPoints = Number(gpData?.pointsBalance ?? 0) || 0;
          tx.update(grandparentRef, {
            pointsBalance: currentGpPoints + grandparentPoints,
            updatedAt: Timestamp.now(),
          });
        }
      }

      const now = Timestamp.now();
      const buyerTxnRef = doc(transactionsCol);
      tx.set(buyerTxnRef, {
        userId: buyerId,
        type: 'points-earned',
        amount: 0,
        pointsEarned: buyerPoints,
        createdAt: now,
        sourceId: purchaseTransactionId,
        description: `Purchase points: ${offerId} x${quantity}`,
      });
      if (parentId != null && parentPoints > 0) {
        const parentTxnRef = doc(transactionsCol);
        tx.set(parentTxnRef, {
          userId: parentId,
          type: 'points-earned',
          amount: 0,
          pointsEarned: parentPoints,
          createdAt: now,
          sourceId: purchaseTransactionId,
          description: `Referral points (L1) from purchase: ${offerId}`,
        });
      }
      if (grandparentId != null && grandparentPoints > 0) {
        const gpTxnRef = doc(transactionsCol);
        tx.set(gpTxnRef, {
          userId: grandparentId,
          type: 'points-earned',
          amount: 0,
          pointsEarned: grandparentPoints,
          createdAt: now,
          sourceId: purchaseTransactionId,
          description: `Referral points (L2) from purchase: ${offerId}`,
        });
      }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Points allocation failed';
    console.error('allocatePointsOnPurchase error:', e);
    return { success: false, error: message };
  }

  return {
    success: true,
    buyerPoints,
    parentPoints,
    grandparentPoints,
  };
}

/**
 * Returns the current points balance for a user (from User.pointsBalance).
 */
export async function getUserPoints(userId: string): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  const user = await getUserById(userId);
  return user?.pointsBalance ?? 0;
}

export type RedeemPointsResult = { success: boolean; error?: string };

/**
 * Deducts points from the user's balance and creates a points-redeemed transaction for audit.
 * Use before issuing a reward (e.g. user coupon). Fails if balance is insufficient.
 */
export async function redeemPoints(params: {
  userId: string;
  points: number;
  description: string;
  sourceId?: string;
}): Promise<RedeemPointsResult> {
  if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' };
  const { userId, points, description, sourceId } = params;
  if (points < 1) return { success: false, error: 'Points must be at least 1.' };

  const userRef = doc(db, 'users', userId);
  const transactionsCol = collection(db, 'transactions');

  try {
    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      const data = userSnap.data();
      const current = Number(data?.pointsBalance ?? 0) || 0;
      if (current < points) throw new Error('Insufficient points balance');
      const newBalance = current - points;
      tx.update(userRef, { pointsBalance: newBalance, updatedAt: Timestamp.now() });
      const ref = doc(transactionsCol);
      tx.set(ref, {
        userId,
        type: 'points-redeemed',
        amount: 0,
        pointsRedeemed: points,
        createdAt: Timestamp.now(),
        description,
        sourceId: sourceId ?? null,
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Redemption failed';
    console.error('redeemPoints error:', e);
    return { success: false, error: message };
  }
  return { success: true };
}
