'use server';

import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

export type VoiceOrderStatus = 'pending' | 'quote-sent' | 'paid' | 'out-for-delivery' | 'delivered' | 'rejected';

export type VoiceOrderLineItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type VoiceOrder = {
  id: string;
  merchantId: string;
  customer: string;
  orderText: string;
  createdAt: Date;
  status: VoiceOrderStatus;
  lineItems?: VoiceOrderLineItem[];
  deliveryCharge?: number;
  totalAmount?: number;
};

const COLLECTION = 'voiceOrders';

function toVoiceOrder(id: string, data: Record<string, unknown>): VoiceOrder {
  const createdAt = data.createdAt instanceof Timestamp ? (data.createdAt as Timestamp).toDate() : new Date();
  return {
    id,
    merchantId: (data.merchantId as string) ?? '',
    customer: (data.customer as string) ?? '',
    orderText: (data.orderText as string) ?? '',
    createdAt,
    status: (data.status as VoiceOrderStatus) ?? 'pending',
    lineItems: data.lineItems as VoiceOrderLineItem[] | undefined,
    deliveryCharge: data.deliveryCharge as number | undefined,
    totalAmount: data.totalAmount as number | undefined,
  };
}

export async function listVoiceOrdersByMerchant(merchantId: string, limitVal: number = 50): Promise<VoiceOrder[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, COLLECTION);
  const q = query(col, where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'), limit(limitVal));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toVoiceOrder(d.id, d.data()));
}

export async function updateVoiceOrderStatus(id: string, status: VoiceOrderStatus): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status });
}

export async function updateVoiceOrderQuote(
  id: string,
  data: { lineItems: VoiceOrderLineItem[]; deliveryCharge: number; totalAmount: number; status: 'quote-sent' }
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, data);
}
