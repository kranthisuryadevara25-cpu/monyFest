'use client';

import { collection, getDocs, Timestamp, query, where, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Offer } from '@/lib/types';

function transformToOffer(docData: Record<string, unknown>): Offer {
  const offer: Record<string, unknown> = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      offer[key] = (docData[key] as Timestamp).toDate();
    } else {
      offer[key] = docData[key];
    }
  }
  return offer as unknown as Offer;
}

/**
 * Client-side fetch of offers so Firestore sees the logged-in user (request.auth).
 * Use this on member/merchant pages that need auth context.
 */
export async function getOffersClient(
  status?: Offer['status'],
  limitVal?: number
): Promise<Offer[]> {
  if (!isFirebaseConfigured) return [];
  const offersCol = collection(db, 'offers');

  let q;
  if (status && limitVal) {
    q = query(offersCol, where('status', '==', status), limit(limitVal));
  } else if (status) {
    q = query(offersCol, where('status', '==', status));
  } else if (limitVal) {
    q = query(offersCol, limit(limitVal));
  } else {
    q = query(offersCol);
  }

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      transformToOffer({ ...doc.data(), offerId: doc.id } as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching offers (client):', error);
    return [];
  }
}
