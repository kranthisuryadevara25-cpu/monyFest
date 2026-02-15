'use server';

import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy, limit, Timestamp, writeBatch, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { MerchantNotification } from '@/lib/types';

const COLLECTION = 'notifications';

function toNotification(id: string, data: Record<string, unknown>): MerchantNotification {
  return {
    id,
    merchantId: (data.merchantId as string) ?? '',
    title: (data.title as string) ?? '',
    type: (data.type as 'system' | 'customer' | 'offer') ?? 'system',
    read: (data.read as boolean) ?? false,
    createdAt: data.createdAt instanceof Timestamp ? (data.createdAt as Timestamp).toDate() : new Date(),
  };
}

export async function createNotification(data: Omit<MerchantNotification, 'id' | 'createdAt'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const col = collection(db, COLLECTION);
  const ref = await addDoc(col, {
    merchantId: data.merchantId,
    title: data.title,
    type: data.type,
    read: data.read,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function listNotificationsForMerchant(merchantId: string, limitVal: number = 50): Promise<MerchantNotification[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, COLLECTION);
  const q = query(
    col,
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc'),
    limit(limitVal)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toNotification(d.id, { ...d.data(), createdAt: d.data().createdAt }));
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { read: true });
}

export async function markAllNotificationsReadForMerchant(merchantId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const notifications = await listNotificationsForMerchant(merchantId, 200);
  const batch = writeBatch(db);
  for (const n of notifications) {
    if (!n.read) batch.update(doc(db, COLLECTION, n.id), { read: true });
  }
  if (notifications.some((n) => !n.read)) await batch.commit();
}
