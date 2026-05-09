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
let app;
if (getApps().length > 0) {
    app = getApp();
} else {
    // Initialize with config (fallback to empty string to prevent initializeApp crash)
    app = initializeApp({
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey || "mock-key",
    });
}

let auth: any = {};
let db: any = {};

try {
    // This will throw if apiKey is missing or invalid ("mock-key")
    if (firebaseConfig.apiKey) {
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.warn("Firebase initialization skipped (likely during SSR build).");
}

export { auth, db };

// Analytics is only supported in the browser
export const analytics = typeof window !== "undefined" ?
    isSupported().then(yes => yes ? getAnalytics(app) : null) :
    null;

export default app;
