
'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';
import firebaseApp, { isFirebaseConfigured } from './firebase';
import { createUser, getUserById } from '@/services/user-service';
import type { UserRole } from './types';

const auth = getAuth(firebaseApp);

export const FIREBASE_NOT_CONFIGURED_MSG =
  'Firebase is not configured. Add your Firebase keys to .env.local (see .env.example). Sign-in is disabled until then.';

function requireFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error(FIREBASE_NOT_CONFIGURED_MSG);
  }
}

type AuthContextType = {
  user: FirebaseUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const signInWithGoogle = async () => {
  requireFirebase();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const userExists = await getUserById(result.user.uid);
    if (!userExists) {
      // User is new, create a document for them.
      const name = result.user.displayName || result.user.email?.split('@')[0] || 'New User';
      const userData = {
        uid: result.user.uid,
        name: name,
        email: result.user.email!,
        avatarUrl: result.user.photoURL,
        role: 'member' as UserRole, // Default role
      };
      await createUser(userData);
    }
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const signUpWithEmail = async (name: string, email: string, password: string, role: UserRole, referralCode?: string) => {
    requireFirebase();
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        
        // After profile is updated in auth, create the user in our DB.
        const userData = {
            uid: result.user.uid,
            name: name,
            email: email,
            avatarUrl: result.user.photoURL,
            role: role,
        };
        await createUser(userData, referralCode);
        
        return result.user;
    } catch (error) {
        console.error("Error signing up with email: ", error);
        throw error;
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    requireFirebase();
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error signing in with email: ", error);
        throw error;
    }
}

export const sendPasswordReset = async (email: string) => {
  requireFirebase();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    throw error;
  }
};


export const signOut = async () => {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
