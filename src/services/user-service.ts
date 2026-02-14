
'use server';

import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';
import { createWelcomeCouponsForUser } from './user-coupon-service';
import { getCommissionSettings } from './commission-service';
import { createTransaction } from './transaction-service';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

// This is a type for the data needed to create a user, to keep it separate from Firebase Auth objects
type UserCreationData = {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string | null;
    merchantId?: string;
}

/**
 * Transforms Firestore document data to the User type, converting Timestamps to Dates.
 * @param docData The data from a Firestore document.
 * @returns A User object.
 */
function transformToUser(docData: any): User {
    const user: any = {};
    for (const key in docData) {
        if (docData[key] instanceof Timestamp) {
            user[key] = docData[key].toDate();
        } else {
            user[key] = docData[key];
        }
    }
    return user as User;
}

/**
 * Fetches all users from the 'users' collection, with an option to filter by role.
 * @param role Optional role to filter by.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getUsers(role?: UserRole): Promise<User[]> {
    if (!isFirebaseConfigured) return [];
    const usersCol = collection(db, 'users');
    const q = role ? query(usersCol, where('role', '==', role)) : usersCol;
    try {
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => transformToUser({ ...doc.data(), uid: doc.id }));
        return userList;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: usersCol.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            // Re-throw the custom error to be caught by the calling function.
            // This stops execution and lets the UI show an error state.
            throw permissionError;
        }
        // For other errors, log and re-throw
        console.error("An unexpected error occurred while fetching users:", serverError);
        throw serverError;
    }
}

/** Generates a unique agent code for new agents (e.g. AGENT-A1B2C3D4). */
function generateAgentCode(uid: string): string {
    return 'AGENT-' + uid.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
}

/**
 * Fetches a single user by their referral code.
 * @param referralCode The referral code to look up.
 * @returns A promise that resolves to the User object or null if not found.
 */
async function getUserByReferralCode(referralCode: string): Promise<User | null> {
    if (!isFirebaseConfigured) return null;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("referralCode", "==", referralCode), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return transformToUser({ ...userDoc.data(), uid: userDoc.id });
}

/**
 * Fetches an agent user by their agent code (for merchant onboarding referral).
 * @param agentCode The agent code to look up.
 * @returns A promise that resolves to the User (agent) or null if not found.
 */
export async function getAgentByAgentCode(agentCode: string): Promise<User | null> {
    if (!isFirebaseConfigured || !agentCode?.trim()) return null;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "agent"), where("agentCode", "==", agentCode.trim()), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const userDoc = querySnapshot.docs[0];
    return transformToUser({ ...userDoc.data(), uid: userDoc.id });
}

/**
 * Ensures an agent has an agentCode (for merchant referral lookup). If missing, generates and saves one.
 * @param uid Agent user id.
 * @returns The agentCode (existing or newly set), or null if user is not an agent or not found.
 */
export async function ensureAgentCode(uid: string): Promise<string | null> {
    if (!isFirebaseConfigured) return null;
    const user = await getUserById(uid);
    if (!user || user.role !== 'agent') return null;
    if (user.agentCode?.trim()) return user.agentCode;
    const code = generateAgentCode(uid);
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { agentCode: code, updatedAt: Timestamp.now() });
    return code;
}

/**
 * Updates a user's profile fields (name, phone, agentCode). Used by agent settings and similar.
 */
export async function updateUser(
    uid: string,
    data: Partial<Pick<User, 'name' | 'phone' | 'agentCode' | 'avatarUrl'>>
): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
    const ref = doc(db, 'users', uid);
    const updates: Record<string, string | ReturnType<typeof Timestamp.now>> = { updatedAt: Timestamp.now() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.agentCode !== undefined) updates.agentCode = data.agentCode;
    if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl;
    if (Object.keys(updates).length <= 1) return;
    await updateDoc(ref, updates);
}

/**
 * Creates a new user document in Firestore.
 * This is typically called right after a user signs up.
 * @param userData The data for the new user.
 * @param referralCode Optional referral code provided during signup.
 * @returns The newly created User object.
 */
export async function createUser(userData: UserCreationData, referralCode?: string): Promise<User | null> {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add your Firebase keys to .env.local (see .env.example).');
    const { uid, name, email, role, avatarUrl } = userData;
    let referredBy: string | undefined = undefined;
    let referralChain: string[] = [];

    if (referralCode) {
        const referrer = await getUserByReferralCode(referralCode);
        if (referrer) {
            referredBy = referrer.uid;
            // Construct the new referral chain
            referralChain = [...(referrer.referralChain || []), referrer.uid];
            // To ensure the chain doesn't exceed 3 levels for commission purposes later
            if (referralChain.length > 3) {
                 referralChain = referralChain.slice(referralChain.length - 3);
            }
        }
    }

    // Set initial status based on role. Members are approved, others are pending.
    const initialStatus = role === 'member' ? 'approved' : 'pending';

    const newUser: User = {
        uid: uid,
        name: name,
        email: email,
        role: role,
        status: initialStatus,
        walletBalance: 0,
        pointsBalance: role === 'member' ? 50 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${uid}/100/100`,
        referralCode: `${(name || 'user').split(' ')[0].toUpperCase()}${uid.slice(0, 4)}`,
        referredBy: referredBy,
        referralChain: referralChain,
        merchantId: userData.merchantId,
        ...(role === 'agent' ? { agentCode: generateAgentCode(uid) } : {}),
    };

    // Firestore does not allow undefined; omit undefined fields for setDoc
    const firestoreData = Object.fromEntries(
        Object.entries(newUser).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;

    const userDocRef = doc(db, 'users', uid);
    
    try {
        await setDoc(userDocRef, firestoreData);
    } catch(serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUser,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        // Re-throw the original error to be caught by the calling function.
        throw serverError;
    }


    // If the new user is a member, grant them welcome coupons.
    if (role === 'member') {
        try {
            await createWelcomeCouponsForUser(uid);
        } catch (couponError) {
            console.error(`Failed to create welcome coupons for user ${uid}:`, couponError);
            throw couponError;
        }
    }

    // Create commission transactions for referrers (up to 3 levels). Only for member signups.
    if (role === 'member' && referralChain.length > 0) {
        try {
            const settings = await getCommissionSettings();
            const levels: (1 | 2 | 3)[] = [1, 2, 3];
            const amounts = [settings.level1, settings.level2, settings.level3];
            const signupName = name || email || 'New member';
            for (let i = 0; i < referralChain.length && i < 3; i++) {
                const referrerId = referralChain[i];
                const level = levels[i];
                const amount = amounts[i];
                if (amount <= 0) continue;
                await createTransaction({
                    userId: referrerId,
                    sourceId: uid,
                    amount,
                    type: 'commission',
                    description: `Level ${level} commission from ${signupName} signup`,
                    payoutStatus: 'pending',
                    commissionLevel: level,
                });
            }
        } catch (commissionError) {
            console.error(`Failed to create commission transactions for signup ${uid}:`, commissionError);
            // Don't fail user creation if commission creation fails
        }
    }

    return newUser;
}


/**
 * Fetches a user from the 'users' collection in Firestore by their UID.
 * This function ONLY fetches a user. It does not create one.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user object, or null if not found.
 */
export async function getUserById(uid: string): Promise<User | null> {
    if (!isFirebaseConfigured) return null;
    const userDocRef = doc(db, 'users', uid);
    
    try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return transformToUser(docSnap.data());
        } else {
            console.log(`No user found with uid: ${uid}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
