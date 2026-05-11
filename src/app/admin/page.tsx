"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit, updateDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, TestResult, Subject } from "@/types";
import Link from "next/link";
import { toast } from "react-hot-toast";
import StatsChart from "@/components/Charts";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
    Users, 
    BookOpen, 
    TrendingUp, 
    BarChart3, 
    Clock, 
    Award,
    FileQuestion,
    GraduationCap,
    Loader2,
    Calendar,
    Crown,
    Shield,
    Medal
} from "lucide-react";
import { formatDistanceToNow, format, startOfDay, subDays } from "date-fns";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTests: 0,
        totalSubjects: 0,
        totalResults: 0,
        avgScore: 0,
    });
    const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const isSuperAdmin = user?.email === "mirzohidmahmutaliyev@gmail.com";

    useEffect(() => {
        // Real-time stats
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
            const onlyUsers = allUsers.filter(u => u.role === "user" && u.status !== "pending_admin");
            const pending = allUsers.filter(u => u.status === "pending_admin");
            
            setStats(prev => ({ ...prev, totalUsers: onlyUsers.length }));
            setPendingRequests(pending);
        });

        const unsubTests = onSnapshot(collection(db, "tests"), (snap) => {
            setStats(prev => ({ ...prev, totalTests: snap.size }));
        });

        const unsubSubjects = onSnapshot(collection(db, "subjects"), (snap) => {
            const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
            setAllSubjects(subjects);
            setStats(prev => ({ ...prev, totalSubjects: snap.size }));
        });

        const unsubResults = onSnapshot(collection(db, "results"), async (snap) => {
            const resultsRaw = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult));
            
            // Get current active users to filter results
            const usersSnap = await getDocs(collection(db, "users"));
            const activeUserIds = new Set(usersSnap.docs.map(d => d.id));

            // Clean up orphaned results (results without existing users)
            const orphanedResults = resultsRaw.filter(r => !activeUserIds.has(r.userId) && !r.isAdminResult);
            if (orphanedResults.length > 0) {
                console.log(`Cleaning up ${orphanedResults.length} orphaned results...`);
                orphanedResults.forEach(async (r) => {
                    try { await deleteDoc(doc(db, "results", r.id!)); } catch(e) {}
                });
            }

            const results = resultsRaw.filter(r => 
                !r.isAdminResult && 
                r.total > 0 && 
                activeUserIds.has(r.userId)
            );
            
            const totalScore = results.reduce((acc, r) => acc + (r.score / r.total), 0);
            const avgScore = results.length > 0 ? Math.round((totalScore / results.length) * 100) : 0;

            setStats(prev => ({
                ...prev,
                totalResults: results.length,
                avgScore
            }));

            // Calculate chart data (last 7 days)
            const days = Array.from({ length: 7 }, (_, i) => {
                const date = subDays(new Date(), 6 - i);
                return {
                    name: format(date, "EEE"),
                    fullDate: startOfDay(date).getTime(),
                    val: 0,
                    count: 0
                };
            });

            results.forEach(r => {
                const resultDate = startOfDay(new Date(r.createdAt)).getTime();
                const dayIndex = days.findIndex(d => d.fullDate === resultDate);
                if (dayIndex !== -1) {
                    days[dayIndex].val += (r.score / r.total) * 100;
                    days[dayIndex].count++;
                }
            });

            const finalChartData = days.map(d => ({
                name: d.name,
                val: d.count > 0 ? Math.round(d.val / d.count) : 0
            }));

            setChartData(finalChartData);
            setLoading(false);
        });

        // Top Students logic
        const unsubTop = onSnapshot(collection(db, "users"), async (userSnap) => {
            const resultsSnap = await getDocs(collection(db, "results"));
            const results = resultsSnap.docs.map(d => d.data() as TestResult);
            
            const students = userSnap.docs
                .map(doc => {
                    const userData = doc.data() as UserProfile;
                    const userResults = results.filter(r => r.userId === doc.id && !r.isAdminResult);
                    const totalScore = userResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
                    return {
                        email: userData.email,
                        totalScore,
                        uid: doc.id,
                        role: userData.role
                    };
                })
                .filter(u => u.role === "user")
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 5);

            setTopStudents(students);
        });

        return () => {
            unsubUsers();
            unsubTests();
            unsubSubjects();
            unsubResults();
            unsubTop();
        };
    }, []);

    const handleApproveAdmin = async (uid: string) => {
        try {
            await updateDoc(doc(db, "users", uid), {
                role: "admin",
                status: "active"
            });
            toast.success(t.admin.overview.approved);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRejectAdmin = async (uid: string) => {
        try {
            await updateDoc(doc(db, "users", uid), {
                status: "active" // Keeps as regular user
            });
            toast.success(t.admin.overview.rejected);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight font-outfit uppercase">{t.admin.overview.title.split(' ')[0]} <span className="text-blue-500 italic">{t.admin.overview.title.split(' ').slice(1).join(' ')}</span></h1>
                    <p className="text-gray-400 font-medium">{t.admin.overview.subtitle}</p>
                </div>
            </div>

            {/* Pending Admin Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="mb-10 animate-pulse">
                    <div className="rounded-3xl border border-blue-500/30 bg-blue-600/5 p-6 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.admin.overview.pending}</h2>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{pendingRequests.length} {t.admin.overview.pendingDesc}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingRequests.map((req) => (
                                <div key={req.uid} className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition-all hover:bg-gray-50 dark:hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold border border-gray-300 dark:border-white/5">
                                            {req.email ? req.email[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{req.email}</p>
                                            <p className="text-[10px] text-gray-500">Kutilmoqda...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApproveAdmin(req.uid)}
                                            className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
                                        >
                                            {t.admin.overview.approve}
                                        </button>
                                        <button
                                            onClick={() => handleRejectAdmin(req.uid)}
                                            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-600 hover:border-red-500/30 active:scale-95"
                                        >
                                            {t.admin.overview.reject}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    { label: t.admin.overview.stats.students, value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
                    { label: t.admin.overview.stats.results, value: stats.totalResults, icon: <TrendingUp className="h-6 w-6" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: t.admin.overview.stats.avgScore, value: `${stats.avgScore}%`, icon: <BarChart3 className="h-6 w-6" />, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Top Students Leaderboard */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Medal className="h-24 w-24 text-blue-500" />
                    </div>
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        {t.admin.overview.leaderboard}
                    </h2>
                    <div className="space-y-4">
                        {topStudents.length > 0 ? topStudents.map((student, idx) => (
                            <motion.div
                                key={student.uid}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/30 p-4 transition-all hover:scale-[1.02] hover:bg-gray-100 dark:hover:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${
                                        idx === 0 ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30" :
                                        idx === 1 ? "bg-gray-300 text-gray-700" :
                                        idx === 2 ? "bg-amber-600 text-white" :
                                        "bg-gray-200 dark:bg-gray-800 text-gray-500"
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px]">
                                            {student.email}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{t.features.secure.title}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{student.totalScore}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{t.admin.users.totalScore}</p>
                                </div>
                            </motion.div>
                        )) : (
                            <p className="text-center py-8 text-gray-500">{t.admin.overview.noData}</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-xl">
                        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            {t.admin.overview.quickActions}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/tests" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-blue-500 hover:shadow-lg">
                                <FileQuestion className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t.admin.overview.addQuestion}</span>
                            </Link>
                            <Link href="/admin/classes" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-emerald-500 hover:shadow-lg">
                                <Users className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t.admin.overview.classes}</span>
                            </Link>
                            <Link href="/admin/subjects" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-amber-500 hover:shadow-lg">
                                <BookOpen className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t.admin.subjects.title}</span>
                            </Link>
                            <Link href="/admin/stats" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-purple-500 hover:shadow-lg">
                                <TrendingUp className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t.adminNav.statistics}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{t.admin.overview.schoolStatus}</h3>
                            <Crown className="h-5 w-5 text-amber-300" />
                        </div>
                        <p className="text-sm text-blue-100 mb-6">{t.admin.overview.schoolStatusDesc}</p>
                        <Link href="/admin/ads" className="inline-block w-full text-center rounded-lg bg-white/20 py-2 text-sm font-bold backdrop-blur-sm hover:bg-white/30 transition-all">
                            {t.admin.ads.newAd}
                        </Link>
                    </div>
                </div>
            </div>

            {/* All Subjects Section (Super Admin Only) */}
            {isSuperAdmin && (
                <div className="mt-12 space-y-6 pb-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-outfit uppercase">
                            {t.admin.overview.allSubjects.split(' ')[0]} <span className="text-blue-500">{t.admin.overview.allSubjects.split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 border border-blue-500/20">
                            {t.admin.overview.total}: {allSubjects.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {allSubjects.map((sub) => (
                            <div key={sub.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 transition-transform group-hover:scale-150" />
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                                    {sub.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {sub.description || t.admin.subjects.noSubjects}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
