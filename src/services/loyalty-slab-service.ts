'use server';

import { doc, getDoc, setDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { LoyaltySlab, LoyaltySlabConfig } from '@/lib/types';
import { getSlabPoints } from '@/lib/loyalty-slabs';

const COLLECTION = 'loyaltySlabConfigs';

/**
 * Fetches slab config for a category/industry. Tries categoryId then "default".
 */
export async function getLoyaltySlabConfig(categoryId: string): Promise<LoyaltySlabConfig | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, COLLECTION, categoryId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    const slabs = Array.isArray(data?.slabs) ? data.slabs as LoyaltySlab[] : [];
    return {
      categoryId,
      slabs: slabs.filter(
        (s): s is LoyaltySlab =>
          typeof s?.minAmountPaise === 'number' && typeof s?.points === 'number'
      ),
      updatedAt: data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
    };
  } catch (e) {
    console.error('getLoyaltySlabConfig error:', e);
    return null;
  }
}

/**
 * Returns points for a purchase: uses slab if config exists for category, else returns null (caller uses per-offer).
 */
export async function getSlabPointsForPurchase(
  totalAmountPaise: number,
  categoryId: string
): Promise<number | null> {
  const config = await getLoyaltySlabConfig(categoryId);
  if (!config?.slabs?.length) return null;
  return getSlabPoints(totalAmountPaise, config.slabs);
}

/**
 * Saves slab config for a category/industry. Slabs should be sorted by minAmountPaise.
 */
export async function setLoyaltySlabConfig(
  categoryId: string,
  slabs: LoyaltySlab[]
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const normalized = slabs
    .map((s) => ({
      minAmountPaise: Math.max(0, Math.floor(s.minAmountPaise)),
      maxAmountPaise: s.maxAmountPaise != null ? Math.max(0, Math.floor(s.maxAmountPaise)) : null,
      points: Math.max(0, Math.floor(s.points)),
    }))
    .sort((a, b) => a.minAmountPaise - b.minAmountPaise);
  const ref = doc(db, COLLECTION, categoryId.trim().toLowerCase() || 'default');
  await setDoc(ref, {
    categoryId: ref.id,
    slabs: normalized,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Lists all slab config category ids (for admin UI).
 */
export async function listLoyaltySlabCategoryIds(): Promise<string[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const col = collection(db, COLLECTION);
    const snap = await getDocs(col);
    return snap.docs.map((d) => d.id);
  } catch (e) {
    console.error('listLoyaltySlabCategoryIds error:', e);
    return [];
  }
}
