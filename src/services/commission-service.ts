'use server';

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { CommissionSettings } from '@/lib/types';

const COMMISSION_SETTINGS_DOC_ID = 'default';

/** Default commission amounts and referral points share. Parent : Buyer : Grandparent = 70 : 20 : 10. */
const DEFAULT_COMMISSION_SETTINGS: CommissionSettings = {
  level1: 5000,
  level2: 3000,
  level3: 2000,
  merchantBonus: 10000,
  parentPointsSharePct: 20,
  loyaltyPointsSharePctParent: 70,
  loyaltyPointsSharePctBuyer: 20,
  loyaltyPointsSharePctGrandparent: 10,
};

/**
 * Fetches commission settings from Firestore. Returns defaults if not configured or doc missing.
 */
export async function getCommissionSettings(): Promise<CommissionSettings> {
  if (!isFirebaseConfigured) return DEFAULT_COMMISSION_SETTINGS;
  const ref = doc(db, 'commissionSettings', COMMISSION_SETTINGS_DOC_ID);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const clamp = (n: number) => Math.min(100, Math.max(0, n));
      return {
        level1: typeof data?.level1 === 'number' ? data.level1 : DEFAULT_COMMISSION_SETTINGS.level1,
        level2: typeof data?.level2 === 'number' ? data.level2 : DEFAULT_COMMISSION_SETTINGS.level2,
        level3: typeof data?.level3 === 'number' ? data.level3 : DEFAULT_COMMISSION_SETTINGS.level3,
        merchantBonus: typeof data?.merchantBonus === 'number' ? data.merchantBonus : DEFAULT_COMMISSION_SETTINGS.merchantBonus,
        parentPointsSharePct: typeof data?.parentPointsSharePct === 'number' ? clamp(data.parentPointsSharePct) : DEFAULT_COMMISSION_SETTINGS.parentPointsSharePct,
        loyaltyPointsSharePctParent: typeof data?.loyaltyPointsSharePctParent === 'number' ? clamp(data.loyaltyPointsSharePctParent) : DEFAULT_COMMISSION_SETTINGS.loyaltyPointsSharePctParent,
        loyaltyPointsSharePctBuyer: typeof data?.loyaltyPointsSharePctBuyer === 'number' ? clamp(data.loyaltyPointsSharePctBuyer) : DEFAULT_COMMISSION_SETTINGS.loyaltyPointsSharePctBuyer,
        loyaltyPointsSharePctGrandparent: typeof data?.loyaltyPointsSharePctGrandparent === 'number' ? clamp(data.loyaltyPointsSharePctGrandparent) : DEFAULT_COMMISSION_SETTINGS.loyaltyPointsSharePctGrandparent,
      };
    }
  } catch (e) {
    console.error('Error fetching commission settings:', e);
  }
  return DEFAULT_COMMISSION_SETTINGS;
}

/**
 * Saves commission settings to Firestore. Amounts must be in paise.
 */
export async function updateCommissionSettings(settings: CommissionSettings): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'commissionSettings', COMMISSION_SETTINGS_DOC_ID);
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  await setDoc(ref, {
    level1: settings.level1,
    level2: settings.level2,
    level3: settings.level3,
    merchantBonus: settings.merchantBonus,
    parentPointsSharePct: clamp(settings.parentPointsSharePct),
    loyaltyPointsSharePctParent: clamp(settings.loyaltyPointsSharePctParent),
    loyaltyPointsSharePctBuyer: clamp(settings.loyaltyPointsSharePctBuyer),
    loyaltyPointsSharePctGrandparent: clamp(settings.loyaltyPointsSharePctGrandparent),
    updatedAt: Timestamp.now(),
  });
}
