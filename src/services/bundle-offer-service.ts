
'use server';

import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { BundleOffer } from '@/lib/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

/**
 * Transforms Firestore document data to the BundleOffer type.
 */
function transformToBundleOffer(docData: any): BundleOffer {
  const offer: any = {};
  for (const key in docData) {
    if (docData[key] instanceof Timestamp) {
      offer[key] = docData[key].toDate();
    } else {
      offer[key] = docData[key];
    }
  }
  return offer as BundleOffer;
}

/**
 * Fetches all bundle offers from the 'bundleOffers' collection in Firestore.
 */
export async function getBundleOffers(status?: 'active' | 'inactive' | 'archived'): Promise<BundleOffer[]> {
    if (!isFirebaseConfigured) return [];
    const bundleOffersCol = collection(db, 'bundleOffers');
    const q = status ? query(bundleOffersCol, where('status', '==', status)) : bundleOffersCol;

    try {
        const snapshot = await getDocs(q);
        const offerList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...transformToBundleOffer(data),
                id: doc.id,
            } as BundleOffer;
        });
        return offerList;
    } catch (error) {
        console.error("Error fetching bundle offers:", error);
        return [];
    }
}

/**
 * Creates a new bundle offer document in Firestore.
 */
export async function createBundleOffer(offerData: Omit<BundleOffer, 'id'>): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add your Firebase keys to .env.local (see .env.example).');
    const offersCol = collection(db, 'bundleOffers');
    try {
        const docRef = await addDoc(offersCol, offerData);
        return docRef.id;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: offersCol.path,
                operation: 'create',
                requestResourceData: offerData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw new Error(`Failed to create bundle offer: ${serverError.message}`);
    }
}

/**
 * Updates an existing bundle offer document in Firestore.
 */
export async function updateBundleOffer(id: string, offerData: Partial<Omit<BundleOffer, 'id'>>): Promise<void> {
    const offerDocRef = doc(db, 'bundleOffers', id);
    try {
        await updateDoc(offerDocRef, offerData);
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: offerDocRef.path,
                operation: 'update',
                requestResourceData: offerData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw new Error(`Failed to update bundle offer: ${serverError.message}`);
    }
}

/**
 * Deletes a bundle offer document from Firestore.
 */
export async function deleteBundleOffer(id: string): Promise<void> {
    const offerDocRef = doc(db, 'bundleOffers', id);
    try {
        await deleteDoc(offerDocRef);
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: offerDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
       throw new Error(`Failed to delete bundle offer: ${serverError.message}`);
    }
}
