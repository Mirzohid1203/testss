"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2, Mail, Lock, UserPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Determine role based on ENV
            const role = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "user";

            // Save user profile to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: role,
                createdAt: Date.now(),
            });

            toast.success("Account created successfully!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">{t.auth.createAccount}</h2>
                    <p className="mt-2 text-sm text-gray-400">TestFlow</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                className="block w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder={t.auth.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                className="block w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder={t.auth.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    {t.auth.register}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        {t.auth.haveAccount}{" "}
                        <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
                            {t.auth.signIn}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
