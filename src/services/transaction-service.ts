
'use server';

import { collection, getDocs, doc, addDoc, updateDoc, Timestamp, query, where, limit, orderBy, CollectionReference, Query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

/**
 * Transforms Firestore document data to the Transaction type, converting Timestamps to Dates.
 */
function transformToTransaction(docData: Record<string, unknown>): Transaction {
  const transaction: Record<string, unknown> = {};
  for (const key in docData) {
    const v = docData[key];
    if (v instanceof Timestamp) {
      transaction[key] = v.toDate();
    } else {
      transaction[key] = v;
    }
  }
  return transaction as unknown as Transaction;
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt'> & { createdAt?: Date };

/**
 * Creates a new transaction in Firestore. Used for commissions on signup and other events.
 */
export async function createTransaction(input: CreateTransactionInput): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const col = collection(db, 'transactions');
  const data: Record<string, unknown> = {
    userId: input.userId,
    amount: input.amount,
    type: input.type,
    createdAt: Timestamp.fromDate(input.createdAt || new Date()),
    description: input.description ?? null,
    sourceId: input.sourceId ?? null,
  };
  if (input.merchantId != null) data.merchantId = input.merchantId;
  if (input.pointsEarned != null) data.pointsEarned = input.pointsEarned;
  if (input.pointsRedeemed != null) data.pointsRedeemed = input.pointsRedeemed;
  if (input.payoutStatus != null) data.payoutStatus = input.payoutStatus;
  if (input.commissionLevel != null) data.commissionLevel = input.commissionLevel;
  if (input.offerId != null) data.offerId = input.offerId;
  if (input.quantity != null) data.quantity = input.quantity;
  const ref = await addDoc(col, data);
  return ref.id;
}

/**
 * Updates the payout status of a commission transaction (e.g. when admin approves/rejects).
 */
export async function updateTransactionPayoutStatus(
  transactionId: string,
  payoutStatus: 'pending' | 'completed' | 'rejected'
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'transactions', transactionId);
  await updateDoc(ref, { payoutStatus });
}

/**
 * Fetches transactions from the 'transactions' collection in Firestore.
 * @param userId Optional user ID to filter transactions for.
 * @param limitVal Optional limit for the number of transactions to fetch.
 * @param types Optional array of transaction types to filter by.
 * @returns A promise that resolves to an array of Transaction objects.
 */
export async function getTransactions(
  userId?: string,
  limitVal?: number,
  types?: Transaction['type'][]
): Promise<Transaction[]> {
  if (!isFirebaseConfigured) return [];
  let q: Query | CollectionReference = collection(db, 'transactions');

  if (userId) {
    q = query(q, where('userId', '==', userId));
  }
  if (types && types.length > 0) {
    q = query(q, where('type', 'in', types));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));

  if (limitVal) {
    q = query(q, limit(limitVal));
  }

  try {
    const transactionSnapshot = await getDocs(q);
    const transactionList = transactionSnapshot.docs.map(d => ({ ...transformToTransaction({ ...d.data(), id: d.id }), id: d.id }));
    return transactionList;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
