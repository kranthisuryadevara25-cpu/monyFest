'use server';

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Advertisement } from '@/lib/types';

const COLLECTION = 'advertisements';

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

export async function listAdvertisements(status?: 'active' | 'inactive'): Promise<Advertisement[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, COLLECTION);
  const q = status ? query(col, where('status', '==', status), orderBy('createdAt', 'desc')) : query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAd(d.id, d.data()));
}

export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toAd(snap.id, snap.data());
}

export async function createAdvertisement(ad: Omit<Advertisement, 'id' | 'createdAt'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const id = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    title: ad.title,
    type: ad.type,
    content: ad.content,
    link: ad.link,
    status: ad.status,
    targetLocation: ad.targetLocation ?? null,
    createdAt: Timestamp.now(),
  });
  return id;
}

export async function updateAdvertisement(id: string, data: Partial<Omit<Advertisement, 'id' | 'createdAt'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.type !== undefined) updates.type = data.type;
  if (data.content !== undefined) updates.content = data.content;
  if (data.link !== undefined) updates.link = data.link;
  if (data.status !== undefined) updates.status = data.status;
  if (data.targetLocation !== undefined) updates.targetLocation = data.targetLocation;
  if (Object.keys(updates).length === 0) return;
  await updateDoc(ref, updates);
}

export async function deleteAdvertisement(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
