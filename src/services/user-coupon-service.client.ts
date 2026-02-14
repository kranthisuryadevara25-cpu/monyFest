'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserCoupon } from '@/lib/types';

/**
 * Client-side fetch of active user coupons so Firestore sees the logged-in user (request.auth).
 */
export async function getUserCouponsClient(userId: string): Promise<UserCoupon[]> {
  if (!isFirebaseConfigured) return [];
  const couponsCol = collection(db, 'userCoupons');
  const q = query(couponsCol, where('userId', '==', userId), where('status', '==', 'active'));
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        userCouponId: d.id,
        expiryDate: data.expiryDate?.toDate?.() ?? data.expiryDate,
      } as UserCoupon;
    });
  } catch (error) {
    console.error(`Error fetching coupons for user (client):`, error);
    return [];
  }
}
