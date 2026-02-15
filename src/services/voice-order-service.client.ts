'use client';

import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { VoiceOrder, VoiceOrderStatus, VoiceOrderLineItem } from '@/services/voice-order-service';

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

export async function listVoiceOrdersByMerchantClient(merchantId: string, limitVal: number = 50): Promise<VoiceOrder[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'voiceOrders');
  const q = query(col, where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'), limit(limitVal));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toVoiceOrder(d.id, d.data()));
}
