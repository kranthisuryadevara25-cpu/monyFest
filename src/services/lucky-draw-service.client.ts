'use client';

import { doc, getDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { LuckyDrawConfig } from '@/lib/types';

/**
 * Client-side fetch of Lucky Draw config so Firestore sees the logged-in user (request.auth).
 * Use from member homepage / dashboard.
 */
export async function getLuckyDrawConfigClient(): Promise<LuckyDrawConfig> {
  const defaultConfig: LuckyDrawConfig = {
    enabled: true,
    minPurchaseRupees: 555,
    rewardType: 'cashback',
    rewardDescription: '100% Cashback',
  };
  if (!isFirebaseConfigured) return defaultConfig;
  const ref = doc(db, 'luckyDrawConfig', 'default');
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAt = data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined;
      return {
        enabled: data?.enabled !== false,
        minPurchaseRupees: typeof data?.minPurchaseRupees === 'number' ? Math.max(0, data.minPurchaseRupees) : defaultConfig.minPurchaseRupees,
        rewardType: ['cashback', 'prize_money', 'vouchers'].includes(data?.rewardType) ? data.rewardType : 'cashback',
        rewardDescription: typeof data?.rewardDescription === 'string' ? data.rewardDescription : defaultConfig.rewardDescription,
        updatedAt,
      };
    }
  } catch (e) {
    console.error('getLuckyDrawConfigClient error:', e);
  }
  return defaultConfig;
}

/**
 * Client-side count of current user's entries for a draw date so Firestore sees request.auth.
 */
export async function getMyEntriesCountClient(userId: string, drawDate: string): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  const col = collection(db, 'luckyDrawEntries');
  const q = query(col, where('drawDate', '==', drawDate), where('userId', '==', userId));
  try {
    const snap = await getDocs(q);
    return snap.size;
  } catch (e) {
    console.error('getMyEntriesCountClient error:', e);
    return 0;
  }
}
