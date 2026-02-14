'use client';

import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Merchant } from '@/lib/types';

function transformToMerchant(docData: Record<string, unknown>): Merchant {
  const merchant: Record<string, unknown> = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      merchant[key] = (docData[key] as Timestamp).toDate();
    } else {
      merchant[key] = docData[key];
    }
  }
  return merchant as unknown as Merchant;
}

/**
 * Client-side fetch of merchants so Firestore sees the logged-in user (request.auth).
 * Use this on member/merchant pages that need auth context.
 */
export async function getMerchantsClient(): Promise<Merchant[]> {
  if (!isFirebaseConfigured) return [];
  const merchantsCol = collection(db, 'merchants');
  try {
    const snapshot = await getDocs(merchantsCol);
    return snapshot.docs.map((doc) =>
      transformToMerchant({ ...doc.data(), merchantId: doc.id } as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching merchants (client):', error);
    return [];
  }
}
