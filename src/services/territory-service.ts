'use server';

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Territory } from '@/lib/types';

const COLLECTION = 'territories';

function toTerritory(id: string, data: Record<string, unknown>): Territory {
  return {
    id,
    name: (data.name as string) ?? '',
    pincodes: Array.isArray(data.pincodes) ? (data.pincodes as string[]) : [],
    assignedAgentId: (data.assignedAgentId as string) ?? '',
  };
}

export async function listTerritories(): Promise<Territory[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, COLLECTION);
  const snap = await getDocs(col);
  return snap.docs.map((d) => toTerritory(d.id, d.data()));
}

export async function getTerritoryById(id: string): Promise<Territory | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toTerritory(snap.id, snap.data());
}

export async function getTerritoryByAgentId(agentId: string): Promise<Territory | null> {
  if (!isFirebaseConfigured) return null;
  const col = collection(db, COLLECTION);
  const q = query(col, where('assignedAgentId', '==', agentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toTerritory(snap.docs[0].id, snap.docs[0].data());
}

export async function createTerritory(territory: Omit<Territory, 'id'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const col = collection(db, COLLECTION);
  const id = `ter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    name: territory.name,
    pincodes: territory.pincodes,
    assignedAgentId: territory.assignedAgentId,
  });
  return id;
}

export async function updateTerritory(id: string, data: Partial<Omit<Territory, 'id'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  const updates: Record<string, string | string[]> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.pincodes !== undefined) updates.pincodes = data.pincodes;
  if (data.assignedAgentId !== undefined) updates.assignedAgentId = data.assignedAgentId;
  if (Object.keys(updates).length === 0) return;
  await updateDoc(ref, updates);
}

export async function deleteTerritory(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
