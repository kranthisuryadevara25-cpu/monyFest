'use server';

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { LuckyDrawConfig, LuckyDrawEntry, LuckyDrawWinner } from '@/lib/types';

const CONFIG_DOC_ID = 'default';

const DEFAULT_CONFIG: LuckyDrawConfig = {
  enabled: true,
  minPurchaseRupees: 555,
  rewardType: 'cashback',
  rewardDescription: '100% Cashback',
  updatedAt: undefined,
};

function getDrawDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns current Lucky Draw config. Used by admin and by eligibility check.
 */
export async function getLuckyDrawConfig(): Promise<LuckyDrawConfig> {
  if (!isFirebaseConfigured) return DEFAULT_CONFIG;
  const ref = doc(db, 'luckyDrawConfig', CONFIG_DOC_ID);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const updatedAt = data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined;
      return {
        enabled: data?.enabled !== false,
        minPurchaseRupees: typeof data?.minPurchaseRupees === 'number' ? Math.max(0, data.minPurchaseRupees) : DEFAULT_CONFIG.minPurchaseRupees,
        rewardType: ['cashback', 'prize_money', 'vouchers'].includes(data?.rewardType) ? data.rewardType : 'cashback',
        rewardDescription: typeof data?.rewardDescription === 'string' ? data.rewardDescription : DEFAULT_CONFIG.rewardDescription,
        updatedAt,
      };
    }
  } catch (e) {
    console.error('getLuckyDrawConfig error:', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves Lucky Draw config (admin only).
 */
export async function updateLuckyDrawConfig(config: LuckyDrawConfig): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'luckyDrawConfig', CONFIG_DOC_ID);
  await setDoc(ref, {
    enabled: config.enabled,
    minPurchaseRupees: Math.max(0, config.minPurchaseRupees),
    rewardType: config.rewardType,
    rewardDescription: (config.rewardDescription || '').trim() || DEFAULT_CONFIG.rewardDescription,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Adds a lucky draw entry when a purchase meets the minimum. Call after recording the purchase.
 * @param userId - Buyer
 * @param transactionId - Purchase transaction id
 * @param amountPaise - Purchase amount in paise
 * @param drawDate - Optional YYYY-MM-DD; defaults to today (server date)
 */
export async function addLuckyDrawEntry(
  userId: string,
  transactionId: string,
  amountPaise: number,
  drawDate?: string
): Promise<{ added: boolean }> {
  if (!isFirebaseConfigured || amountPaise <= 0) return { added: false };
  const config = await getLuckyDrawConfig();
  if (!config.enabled || config.minPurchaseRupees <= 0) return { added: false };
  const amountRupees = amountPaise / 100;
  if (amountRupees < config.minPurchaseRupees) return { added: false };

  const dateStr = drawDate || getDrawDate();
  const col = collection(db, 'luckyDrawEntries');
  await addDoc(col, {
    userId,
    transactionId,
    amountRupees,
    drawDate: dateStr,
    createdAt: Timestamp.now(),
  });
  return { added: true };
}

/**
 * Returns all entries for a given draw date (for admin to run draw).
 */
export async function getEntriesForDraw(drawDate: string): Promise<LuckyDrawEntry[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'luckyDrawEntries');
  const q = query(col, where('drawDate', '==', drawDate), orderBy('createdAt', 'asc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId ?? '',
        transactionId: data.transactionId ?? '',
        amountRupees: Number(data.amountRupees) || 0,
        drawDate: data.drawDate ?? drawDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      } as LuckyDrawEntry;
    });
  } catch (e) {
    console.error('getEntriesForDraw error:', e);
    return [];
  }
}

/**
 * Runs the draw for a date: picks one random winner from entries, creates winner record.
 * Idempotent: if winner already exists for that date, returns existing.
 */
export async function runDrawForDate(drawDate: string): Promise<
  { success: true; winnerId: string; winnerUserId: string } | { success: false; error: string }
> {
  if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' };
  const winnersCol = collection(db, 'luckyDrawWinners');
  const existingQ = query(winnersCol, where('drawDate', '==', drawDate), limit(1));
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const w = existingSnap.docs[0].data();
    return { success: true, winnerId: existingSnap.docs[0].id, winnerUserId: w.userId ?? '' };
  }

  const entries = await getEntriesForDraw(drawDate);
  if (entries.length === 0) return { success: false, error: `No entries for draw date ${drawDate}.` };

  const config = await getLuckyDrawConfig();
  const randomIndex = Math.floor(Math.random() * entries.length);
  const winner = entries[randomIndex];

  const ref = doc(winnersCol);
  await setDoc(ref, {
    drawDate,
    userId: winner.userId,
    rewardType: config.rewardType,
    rewardDescription: config.rewardDescription,
    transactionId: winner.transactionId,
    createdAt: Timestamp.now(),
  });
  return { success: true, winnerId: ref.id, winnerUserId: winner.userId };
}

/**
 * List winners for the winner board (newest first).
 */
export async function getLuckyDrawWinners(limitVal: number = 50): Promise<(LuckyDrawWinner & { userName?: string })[]> {
  if (!isFirebaseConfigured) return [];
  const col = collection(db, 'luckyDrawWinners');
  const q = query(col, orderBy('createdAt', 'desc'), limit(limitVal));
  try {
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        drawDate: data.drawDate ?? '',
        userId: data.userId ?? '',
        rewardType: data.rewardType ?? 'cashback',
        rewardDescription: data.rewardDescription ?? '',
        transactionId: data.transactionId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      } as LuckyDrawWinner;
    });
    const { getUserById } = await import('./user-service');
    const withNames = await Promise.all(
      list.map(async (w) => {
        const user = await getUserById(w.userId);
        return { ...w, userName: user ? (user.name || user.email || 'Winner') : 'Winner' };
      })
    );
    return withNames;
  } catch (e) {
    console.error('getLuckyDrawWinners error:', e);
    return [];
  }
}

/**
 * Count entries for a user for a given date (for dashboard "Your entries today").
 */
export async function getMyEntriesCount(userId: string, drawDate: string): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  const col = collection(db, 'luckyDrawEntries');
  const q = query(col, where('drawDate', '==', drawDate), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.size;
}
