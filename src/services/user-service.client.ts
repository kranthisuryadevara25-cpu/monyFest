'use client';

import { collection, getDocs, getDoc, doc, query, where, limit, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';

function transformToUser(docData: Record<string, unknown>): User {
  const user: Record<string, unknown> = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      user[key] = (docData[key] as Timestamp).toDate();
    } else {
      user[key] = docData[key];
    }
  }
  return user as unknown as User;
}

/**
 * Client-side fetch of users so Firestore sees the logged-in user (request.auth).
 * Use from admin/agent/merchant/member pages when listing or counting users.
 */
export async function getUsersClient(role?: UserRole): Promise<User[]> {
  if (!isFirebaseConfigured) return [];
  const usersCol = collection(db, 'users');
  const q = role ? query(usersCol, where('role', '==', role)) : query(usersCol);
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) =>
      transformToUser({ ...d.data(), uid: d.id } as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching users (client):', error);
    throw error;
  }
}

/**
 * Client-side fetch of a single user by ID so Firestore sees the logged-in user.
 */
export async function getUserByIdClient(uid: string): Promise<User | null> {
  if (!isFirebaseConfigured) return null;
  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return transformToUser({ ...snap.data(), uid: snap.id } as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching user (client):', error);
    return null;
  }
}
