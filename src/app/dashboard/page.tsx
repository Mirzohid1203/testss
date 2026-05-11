"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        if (!user || !profile) return;

        // Get student's grade level
        let studentGrade = "9";
        if (profile?.className) {
            const match = profile.className.match(/\d+/);
            if (match) studentGrade = match[0];
        }

        // Fetch Subjects and Tests to filter
        const fetchData = async () => {
            try {
                const subSnap = await getDocs(query(collection(db, "subjects"), orderBy("createdAt", "desc")));
                const testSnap = await getDocs(query(collection(db, "tests"), where("gradeLevel", "==", studentGrade)));
                
                const allSubjects = subSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
                const activeSubjectIds = new Set(testSnap.docs.map(d => d.data().subjectId));
                
                const filteredSubjects = allSubjects.filter(s => {
                    if (profile?.role === 'admin' || profile?.role === 'superadmin') return true;
                    return activeSubjectIds.has(s.id) && s.allowedGrades?.includes(studentGrade);
                });
                
                setSubjects(filteredSubjects);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, profile]);

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-outfit">{t.dashboard.title}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t.dashboard.subtitle}</p>
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
                                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm transition-all hover:border-blue-500/50 hover:bg-white dark:hover:bg-gray-900/80 hover:shadow-xl dark:hover:shadow-blue-500/10">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="rounded-xl bg-blue-600/10 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {subject.title}
                                    </h3>
                                    <p className="mb-6 flex-grow text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {subject.description}
                                    </p>
                                    <Link
                                        href={`/test/${subject.id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white transition-all hover:bg-blue-600 hover:text-white"
                                    >
                                        {t.dashboard.startTest}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 py-24 text-center shadow-inner">
                        <BookOpen className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-300">{t.dashboard.noSubjects}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-500">{t.dashboard.checkBack}</p>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}
