
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserCoupon } from '@/lib/types';
import { add } from 'date-fns';
import { getWelcomeCoupons } from './welcome-coupon-service';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';


/**
 * Creates a new single user coupon document in Firestore.
 */
export async function createUserCoupon(couponData: Omit<UserCoupon, 'userCouponId'>): Promise<string> {
    const userCouponsCol = collection(db, 'userCoupons');
    
    try {
        const docRef = await addDoc(userCouponsCol, couponData);
        return docRef.id;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userCouponsCol.path,
                operation: 'create',
                requestResourceData: couponData,
            });
            errorEmitter.emit('permission-error', permissionError);
            // Throw the detailed error so it can be caught and identified up the chain.
            throw permissionError;
        }
        // For other server errors, throw a generic error.
        throw new Error(`Failed to create user coupon: ${serverError.message}`);
    }
}


/**
 * Creates a set of welcome coupons for a new user by fetching them from the 'welcomeCoupons' collection.
 * @param userId The UID of the new user.
 */
export async function createWelcomeCouponsForUser(userId: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    // Fetch the dynamic list of welcome coupons
    const welcomeCoupons = await getWelcomeCoupons();

    if (welcomeCoupons.length === 0) {
        console.log("No welcome coupons configured. Skipping creation for user " + userId);
        return;
    }

    const thirtyDaysFromNow = add(new Date(), { days: 30 });

    try {
        const couponPromises = welcomeCoupons.map(coupon => {
            const newCoupon: Omit<UserCoupon, 'userCouponId'> = {
                userId: userId,
                title: coupon.title,
                category: coupon.category,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                expiryDate: thirtyDaysFromNow,
                status: 'active',
            };
            return createUserCoupon(newCoupon);
        });

        await Promise.all(couponPromises);
        console.log(`Successfully created ${welcomeCoupons.length} welcome coupons for user ${userId}.`);

    } catch (error) {
        console.error("Error creating welcome coupons:", error);
        // Re-throw the original error to preserve its type (e.g., FirestorePermissionError)
        throw error;
    }
}
