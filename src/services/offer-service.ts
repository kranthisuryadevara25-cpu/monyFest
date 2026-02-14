
'use server';

import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp, query, where, limit, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Offer } from '@/lib/types';

/** Serialize Offer for Firestore (dates -> Timestamp). */
function offerToFirestore(offer: Offer): Record<string, unknown> {
  const data: Record<string, unknown> = {
    merchantIds: offer.merchantIds,
    merchantName: offer.merchantName,
    merchantLogo: offer.merchantLogo,
    title: offer.title,
    description: offer.description,
    expiryDate: offer.expiryDate instanceof Date ? Timestamp.fromDate(offer.expiryDate) : offer.expiryDate,
    status: offer.status,
    offerType: offer.offerType,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
  };
  if (offer.points != null) data.points = offer.points;
  if (offer.loyalty_points != null) data.loyalty_points = offer.loyalty_points;
  if (offer.includedItems != null) data.includedItems = offer.includedItems;
  if (offer.bonusRuleDescription != null) data.bonusRuleDescription = offer.bonusRuleDescription;
  if (offer.minimumOrderValue != null) data.minimumOrderValue = offer.minimumOrderValue;
  if (offer.maxDiscountValue != null) data.maxDiscountValue = offer.maxDiscountValue;
  return data;
}

/**
 * Transforms Firestore document data to the Offer type, converting Timestamps to Dates.
 */
function transformToOffer(docData: any): Offer {
    const offer: any = {};
    for (const key in docData) {
        if (docData[key] instanceof Timestamp) {
            offer[key] = docData[key].toDate();
        } else {
            offer[key] = docData[key];
        }
    }
    return offer as Offer;
}

/**
 * Fetches offers from the 'offers' collection in Firestore.
 * @param status Optional status to filter offers by.
 * @param limitVal Optional limit for the number of offers to fetch.
 * @returns A promise that resolves to an array of Offer objects.
 */
export async function getOffers(status?: Offer['status'], limitVal?: number): Promise<Offer[]> {
    if (!isFirebaseConfigured) return [];
    const offersCol = collection(db, 'offers');
    
    let q;
    if (status && limitVal) {
        q = query(offersCol, where('status', '==', status), limit(limitVal));
    } else if (status) {
        q = query(offersCol, where('status', '==', status));
    } else if (limitVal) {
        q = query(offersCol, limit(limitVal));
    } else {
        q = query(offersCol);
    }

    try {
        const offerSnapshot = await getDocs(q);
        const offerList = offerSnapshot.docs.map(doc => transformToOffer({ ...doc.data(), offerId: doc.id }));
        return offerList;
    } catch (error) {
        console.error("Error fetching offers:", error);
        return [];
    }
}

/**
 * Fetches a single offer by id. Used for purchase flow and points allocation.
 */
export async function getOfferById(offerId: string): Promise<Offer | null> {
  if (!isFirebaseConfigured) return null;
  const ref = doc(db, 'offers', offerId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return transformToOffer({ ...snap.data(), offerId: snap.id });
  } catch (e) {
    console.error('Error fetching offer:', e);
    return null;
  }
}

/**
 * Creates a new offer in Firestore. Returns the new offer id.
 */
export async function createOffer(offer: Omit<Offer, 'offerId'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const col = collection(db, 'offers');
  const data = offerToFirestore({ ...offer, offerId: '' });
  data.updatedAt = Timestamp.now();
  const ref = await addDoc(col, data);
  return ref.id;
}

/**
 * Updates an existing offer in Firestore. Only provided fields are updated.
 */
export async function updateOffer(offerId: string, offer: Partial<Omit<Offer, 'offerId'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'offers', offerId);
  const data: Record<string, unknown> = { updatedAt: Timestamp.now() };
  if (offer.merchantIds != null) data.merchantIds = offer.merchantIds;
  if (offer.merchantName != null) data.merchantName = offer.merchantName;
  if (offer.merchantLogo != null) data.merchantLogo = offer.merchantLogo;
  if (offer.title != null) data.title = offer.title;
  if (offer.description != null) data.description = offer.description;
  if (offer.expiryDate != null) data.expiryDate = offer.expiryDate instanceof Date ? Timestamp.fromDate(offer.expiryDate) : offer.expiryDate;
  if (offer.status != null) data.status = offer.status;
  if (offer.offerType != null) data.offerType = offer.offerType;
  if (offer.discountType != null) data.discountType = offer.discountType;
  if (offer.discountValue != null) data.discountValue = offer.discountValue;
  if (offer.points !== undefined) data.points = offer.points;
  if (offer.loyalty_points !== undefined) data.loyalty_points = offer.loyalty_points;
  if (offer.includedItems !== undefined) data.includedItems = offer.includedItems;
  if (offer.bonusRuleDescription !== undefined) data.bonusRuleDescription = offer.bonusRuleDescription;
  if (offer.minimumOrderValue !== undefined) data.minimumOrderValue = offer.minimumOrderValue;
  if (offer.maxDiscountValue !== undefined) data.maxDiscountValue = offer.maxDiscountValue;
  await updateDoc(ref, data as Record<string, import('firebase/firestore').FieldValue | string | number | boolean | null | undefined>);
}

/**
 * Updates only the status of an offer.
 */
export async function updateOfferStatus(offerId: string, status: Offer['status']): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'offers', offerId);
  await updateDoc(ref, { status, updatedAt: Timestamp.now() });
}

/**
 * Deletes an offer from Firestore.
 */
export async function deleteOffer(offerId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const ref = doc(db, 'offers', offerId);
  await deleteDoc(ref);
}
