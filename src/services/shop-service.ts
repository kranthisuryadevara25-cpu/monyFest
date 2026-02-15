'use server';

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Shop } from '@/lib/types';

const COLLECTION = 'shops';

function toShop(id: string, data: Record<string, unknown>): Shop {
  return {
    id,
    merchantId: (data.merchantId as string) ?? '',
    name: (data.name as string) ?? '',
    address: (data.address as string) ?? '',
    pincode: (data.pincode as string) ?? '',
    status: (data.status as 'Open' | 'Closed') ?? 'Open',
  };
}

export async function listShopsByMerchant(merchantId: string): Promise<Shop[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, COLLECTION);
  const q = query(col, where('merchantId', '==', merchantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toShop(d.id, d.data()));
}

export async function getShopById(id: string): Promise<Shop | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toShop(snap.id, snap.data());
}

export async function createShop(shop: Omit<Shop, 'id'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const col = collection(db, COLLECTION);
  const id = `shop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    merchantId: shop.merchantId,
    name: shop.name,
    address: shop.address,
    pincode: shop.pincode,
    status: shop.status,
  });
  return id;
}

export async function updateShop(id: string, data: Partial<Omit<Shop, 'id' | 'merchantId'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  const updates: Record<string, string> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.address !== undefined) updates.address = data.address;
  if (data.pincode !== undefined) updates.pincode = data.pincode;
  if (data.status !== undefined) updates.status = data.status;
  if (Object.keys(updates).length === 0) return;
  await updateDoc(ref, updates);
}

export async function deleteShop(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
