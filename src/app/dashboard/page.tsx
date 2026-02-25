"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { BookOpen, ArrowRight, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const subjectsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Subject[];
                setSubjects(subjectsData);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white">{t.dashboard.title}</h1>
                    <p className="mt-2 text-gray-400">{t.dashboard.subtitle}</p>
                </header>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                ) : subjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((subject, index) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-blue-500/50 hover:bg-gray-900/80 hover:shadow-2xl hover:shadow-blue-500/10">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="rounded-xl bg-blue-600/10 p-3 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white group-hover:text-blue-400">
                                        {subject.title}
                                    </h3>
                                    <p className="mb-6 flex-grow text-sm text-gray-400 line-clamp-2">
                                        {subject.description}
                                    </p>
                                    <Link
                                        href={`/test/${subject.id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 group-hover:border-transparent"
                                    >
                                        {t.dashboard.startTest}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-24 text-center">
                        <Info className="mb-4 h-12 w-12 text-gray-600" />
                        <h3 className="text-xl font-medium text-gray-300">{t.dashboard.noSubjects}</h3>
                        <p className="mt-2 text-gray-500">{t.dashboard.checkBack}</p>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}
