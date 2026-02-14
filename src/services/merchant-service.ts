
'use server';

import { collection, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Merchant } from '@/lib/types';
import { getCommissionSettings } from './commission-service';
import { createTransaction } from './transaction-service';

/**
 * Transforms Firestore document data to the Merchant type, converting Timestamps to Dates.
 */
function transformToMerchant(docData: Record<string, unknown>): Merchant {
  const merchant: Record<string, unknown> = {};
  for (const key in docData) {
    const v = docData[key];
    if (v instanceof Timestamp) {
      merchant[key] = v.toDate();
    } else {
      merchant[key] = v;
    }
  }
  return merchant as unknown as Merchant;
}

/**
 * Fetches all merchants from the 'merchants' collection in Firestore.
 * @returns A promise that resolves to an array of Merchant objects.
 */
export async function getMerchants(): Promise<Merchant[]> {
  if (!isFirebaseConfigured) return [];
  const merchantsCol = collection(db, 'merchants');
  try {
    const merchantSnapshot = await getDocs(merchantsCol);
    const merchantList = merchantSnapshot.docs.map(d => transformToMerchant({ ...d.data(), merchantId: d.id }));
    return merchantList;
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return [];
  }
}

/**
 * Fetches a single merchant by id. Used for category/industry in loyalty slab lookup.
 */
export async function getMerchantById(merchantId: string): Promise<Merchant | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, 'merchants', merchantId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return transformToMerchant({ ...snap.data(), merchantId: snap.id });
  } catch (e) {
    console.error('Error fetching merchant:', e);
    return null;
  }
}

/**
 * Creates a new merchant document. If linkedAgentId is set and merchant bonus > 0,
 * creates a commission transaction for the recruiting agent (merchant recruitment bonus).
 * @param data Merchant data; merchantId is used as the Firestore document id.
 * @returns The merchantId (same as data.merchantId).
 */
export async function createMerchant(data: Merchant): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'merchants', data.merchantId);
  const firestoreData: Record<string, unknown> = {
    ...data,
    createdAt: data.createdAt instanceof Date ? Timestamp.fromDate(data.createdAt) : data.createdAt,
  };
  await setDoc(ref, firestoreData);

  if (data.linkedAgentId && data.linkedAgentId.trim() !== '') {
    try {
      const settings = await getCommissionSettings();
      if (settings.merchantBonus > 0) {
        await createTransaction({
          userId: data.linkedAgentId,
          sourceId: data.merchantId,
          amount: settings.merchantBonus,
          type: 'commission',
          description: `Merchant recruitment bonus: ${data.name}`,
          payoutStatus: 'pending',
        });
      }
    } catch (e) {
      console.error('Failed to create merchant recruitment bonus transaction:', e);
    }
  }

  return data.merchantId;
}

/** Default logo when none provided */
const DEFAULT_MERCHANT_LOGO = 'https://picsum.photos/seed/merchant/200/200';

export type CreateMerchantFromOnboardingParams = {
  merchantId: string;
  name: string;
  category: Merchant['category'];
  gstin?: string;
  agentCode?: string;
};

/**
 * Creates a merchant profile from onboarding form data. Resolves agent by agentCode
 * and sets linkedAgentId so the recruiting agent receives the merchant bonus if configured.
 */
export async function createMerchantProfileFromOnboarding(
  params: CreateMerchantFromOnboardingParams
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' };
  let linkedAgentId = '';
  if (params.agentCode?.trim()) {
    const { getAgentByAgentCode } = await import('./user-service');
    const agent = await getAgentByAgentCode(params.agentCode.trim());
    if (agent) linkedAgentId = agent.uid;
  }
  const merchant: Merchant = {
    merchantId: params.merchantId,
    name: params.name.trim() || 'Merchant',
    logo: DEFAULT_MERCHANT_LOGO,
    commissionRate: 5,
    linkedAgentId,
    createdAt: new Date(),
    category: params.category,
    gstin: params.gstin?.trim() || undefined,
  };
  try {
    await createMerchant(merchant);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create merchant profile.';
    return { success: false, error: message };
  }
}
