"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2, Mail, Lock, UserPlus, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchClasses = async () => {
            const q = query(collection(db, "classes"), orderBy("name", "asc"));
            const snap = await getDocs(q);
            setClasses(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        };
        fetchClasses();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Default role is user. Only superadmin is assigned from ENV automatically.
            // Admins are appointed by the superadmin.
            let role = "user";
            if (email === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
                role = "superadmin";
            }

            // Save user profile to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: role,
                classId: selectedClass,
                className: classes.find(c => c.id === selectedClass)?.name || "",
                createdAt: Date.now(),
            });

            toast.success(t.common.accountCreated);
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
                    <p className="mt-2 text-sm text-gray-400">3-IDUM TTM</p>
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

                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <select
                                required
                                className="block w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm appearance-none"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="" disabled>Sinfingizni tanlang</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
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
