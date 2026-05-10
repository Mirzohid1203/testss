"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isConfigValid } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isSuperAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConfigValid) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user profile from Firestore
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                } else {
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (!isConfigValid) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-center">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 max-w-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Missing</h1>
                    <p className="text-gray-400 mb-6">
                        Firebase configuration is missing. Please add the required environment variables to your Vercel project.
                    </p>
                    <div className="text-left bg-black/50 p-4 rounded-lg font-mono text-xs text-gray-500 mb-6">
                        NEXT_PUBLIC_FIREBASE_API_KEY<br/>
                        NEXT_PUBLIC_FIREBASE_PROJECT_ID<br/>
                        ... (and others)
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition-all hover:bg-red-700"
                    >
                        Check Again
                    </button>
                </div>
            </div>
        );
    }

    const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || profile?.role === 'superadmin';
    const isAdmin = isSuperAdmin || profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSuperAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
