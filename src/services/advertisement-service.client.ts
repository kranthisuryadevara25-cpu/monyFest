'use client';

import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Advertisement } from '@/lib/types';

function toAd(id: string, data: Record<string, unknown>): Advertisement {
  return {
    id,
    title: (data.title as string) ?? '',
    type: (data.type as Advertisement['type']) ?? 'image',
    content: (data.content as string) ?? '',
    link: (data.link as string) ?? '',
    status: (data.status as 'active' | 'inactive') ?? 'inactive',
    createdAt: data.createdAt instanceof Timestamp ? (data.createdAt as Timestamp).toDate() : new Date(),
    targetLocation: data.targetLocation as string | undefined,
  };
}

export async function listAdvertisementsClient(status?: 'active' | 'inactive'): Promise<Advertisement[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'advertisements');
  const q = status ? query(col, where('status', '==', status), orderBy('createdAt', 'desc')) : query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAd(d.id, d.data()));
}
