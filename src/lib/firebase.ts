import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
// Special check for mapping the exact env var names used
const actualMissingKeys: string[] = [];
if (!firebaseConfig.apiKey) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
if (!firebaseConfig.storageBucket) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfig.messagingSenderId) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) actualMissingKeys.push("NEXT_PUBLIC_FIREBASE_APP_ID");

const isConfigValid = actualMissingKeys.length === 0;

const app = getApps().length > 0 ? getApp() : initializeApp({
    apiKey: firebaseConfig.apiKey || "mock-api-key",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId || "tests-a9543", 
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId,
});

// Helper to prevent crashes if auth/db are accessed before proper initialization
const auth = isConfigValid ? getAuth(app) : { currentUser: null } as any;
const db = isConfigValid ? getFirestore(app) : {} as any;

export { auth, db, isConfigValid, actualMissingKeys };

// Analytics is only supported in the browser
export const analytics = typeof window !== "undefined" ?
    isSupported().then(yes => yes ? getAnalytics(app) : null) :
    null;

export default app;
