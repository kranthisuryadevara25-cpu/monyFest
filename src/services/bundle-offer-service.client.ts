'use client';

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { BundleOffer } from '@/lib/types';

function transformToBundleOffer(docData: Record<string, unknown>): BundleOffer {
  const offer: Record<string, unknown> = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      offer[key] = (docData[key] as Timestamp).toDate();
    } else {
      offer[key] = docData[key];
    }
  }
  return offer as unknown as BundleOffer;
}

/**
 * Client-side fetch of bundle offers so Firestore sees the logged-in user (request.auth).
 */
export async function getBundleOffersClient(
  status?: 'active' | 'inactive' | 'archived'
): Promise<BundleOffer[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'bundleOffers');
  const q = status ? query(col, where('status', '==', status)) : query(col);
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...transformToBundleOffer(d.data() as Record<string, unknown>),
      id: d.id,
    })) as BundleOffer[];
  } catch (error) {
    console.error('Error fetching bundle offers (client):', error);
    return [];
  }
}
