
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig =
  !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

// Use placeholder config when env is missing so the app can load for local preview
const config = hasFirebaseConfig
  ? firebaseConfig
  : {
      apiKey: 'preview',
      authDomain: 'localhost',
      projectId: 'preview',
      storageBucket: 'preview.appspot.com',
      messagingSenderId: '000',
      appId: '1:000:web:000',
    };

let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(config);
} else {
  firebaseApp = getApp();
}

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const isFirebaseConfigured = hasFirebaseConfig;
export default firebaseApp;
