'use client';

import { collection, getDocs, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

function transformToTransaction(docData: Record<string, unknown>): Transaction {
  const transaction: Record<string, unknown> = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      transaction[key] = (docData[key] as Timestamp).toDate();
    } else {
      transaction[key] = docData[key];
    }
  }
  return transaction as unknown as Transaction;
}

/**
 * Client-side fetch of transactions so Firestore sees the logged-in user (request.auth).
 */
export async function getTransactionsClient(
  userId?: string,
  limitVal?: number,
  types?: Transaction['type'][]
): Promise<Transaction[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'transactions');
  let q = query(col, orderBy('createdAt', 'desc'));
  if (userId) q = query(q, where('userId', '==', userId));
  if (types?.length) q = query(q, where('type', 'in', types));
  if (limitVal != null) q = query(q, limit(limitVal));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) =>
      transformToTransaction({ ...d.data(), id: d.id } as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching transactions (client):', error);
    return [];
  }
}
