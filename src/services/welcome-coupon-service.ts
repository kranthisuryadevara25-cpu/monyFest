
'use server';

import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { WelcomeCoupon } from '@/lib/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';


const WELCOME_COUPONS_COLLECTION = 'welcomeCoupons';

/**
 * Fetches all welcome coupons from the 'welcomeCoupons' collection in Firestore.
 */
export async function getWelcomeCoupons(): Promise<WelcomeCoupon[]> {
    if (!isFirebaseConfigured) return [];
    const couponsCol = collection(db, WELCOME_COUPONS_COLLECTION);
    try {
        const snapshot = await getDocs(couponsCol);
        if (snapshot.empty) {
            return [];
        }
        const couponList = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        } as WelcomeCoupon));
        return couponList;
    } catch (error) {
        console.error("Error fetching welcome coupons:", error);
        return [];
    }
}

/**
 * Creates a new welcome coupon document in Firestore.
 */
export async function createWelcomeCoupon(couponData: Omit<WelcomeCoupon, 'id'>): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add your Firebase keys to .env.local (see .env.example).');
    const couponsCol = collection(db, WELCOME_COUPONS_COLLECTION);
    try {
        const docRef = await addDoc(couponsCol, couponData);
        return docRef.id;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: couponsCol.path,
                operation: 'create',
                requestResourceData: couponData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw new Error(`Failed to create welcome coupon: ${serverError.message}`);
    }
}

/**
 * Updates an existing welcome coupon document in Firestore.
 */
export async function updateWelcomeCoupon(id: string, couponData: Partial<Omit<WelcomeCoupon, 'id'>>): Promise<void> {
    const couponDocRef = doc(db, WELCOME_COUPONS_COLLECTION, id);
    try {
        const { id: _, ...updateData } = couponData as WelcomeCoupon;
        await updateDoc(couponDocRef, updateData);
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: couponDocRef.path,
                operation: 'update',
                requestResourceData: couponData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw new Error(`Failed to update welcome coupon: ${serverError.message}`);
    }
}

/**
 * Deletes a welcome coupon document from Firestore.
 */
export async function deleteWelcomeCoupon(id: string): Promise<void> {
    const couponDocRef = doc(db, WELCOME_COUPONS_COLLECTION, id);
    try {
        await deleteDoc(couponDocRef);
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: couponDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw new Error(`Failed to delete welcome coupon: ${serverError.message}`);
    }
}
