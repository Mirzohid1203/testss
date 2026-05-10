"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, TestResult, Subject } from "@/types";
import Link from "next/link";
import StatsChart from "@/components/Charts";
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
    Crown
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
    const [recentResults, setRecentResults] = useState<TestResult[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time stats
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const onlyUsers = snap.docs.filter(d => (d.data() as UserProfile).role === "user");
            setStats(prev => ({ ...prev, totalUsers: onlyUsers.length }));
        });

        const unsubTests = onSnapshot(collection(db, "tests"), (snap) => {
            setStats(prev => ({ ...prev, totalTests: snap.size }));
        });

        const unsubSubjects = onSnapshot(collection(db, "subjects"), (snap) => {
            setStats(prev => ({ ...prev, totalSubjects: snap.size }));
        });

        const unsubResults = onSnapshot(collection(db, "results"), (snap) => {
            const results = snap.docs
                .map(d => d.data() as TestResult)
                .filter(r => !r.isAdminResult && r.total > 0); // Safety check for total > 0
            
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

        // Recent results query
        const qRecent = query(collection(db, "results"), orderBy("createdAt", "desc"));
        const unsubRecent = onSnapshot(qRecent, (snap) => {
            const allResults = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult));
            const filteredResults = allResults.filter(r => !r.isAdminResult).slice(0, 5);
            setRecentResults(filteredResults);
        });

        return () => {
            unsubUsers();
            unsubTests();
            unsubSubjects();
            unsubResults();
            unsubRecent();
        };
    }, []);

    const statCards = [
        { name: "Total Users", value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: "bg-blue-500" },
        { name: "Tests Created", value: stats.totalTests, icon: <FileQuestion className="h-6 w-6" />, color: "bg-purple-500" },
        { name: "Tests Taken", value: stats.totalResults, icon: <GraduationCap className="h-6 w-6" />, color: "bg-emerald-500" },
        { name: "Average Score", value: `${stats.avgScore}%`, icon: <TrendingUp className="h-6 w-6" />, color: "bg-orange-500" },
    ];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Dashboard Overview</h1>
                <p className="text-gray-500 dark:text-gray-400">Real-time platform statistics and activity</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Subjects</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubjects}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Score</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Results */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-xl">
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                    <div className="space-y-4">
                        {recentResults.length > 0 ? recentResults.map((res) => (
                            <div key={res.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/30 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${res.score / res.total >= 0.7 ? "bg-green-500" : "bg-red-500"}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{res.subjectTitle}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Result: {res.score}/{res.total}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        {res.createdAt ? formatDistanceToNow(new Date(res.createdAt), { addSuffix: true }) : "recently"}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-gray-500">No recent activities</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-xl">
                        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Tezkor Amallar
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/tests" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-blue-500 hover:shadow-lg">
                                <FileQuestion className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Savol Qo'shish</span>
                            </Link>
                            <Link href="/admin/classes" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-emerald-500 hover:shadow-lg">
                                <Users className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Sinflar</span>
                            </Link>
                            <Link href="/admin/subjects" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-amber-500 hover:shadow-lg">
                                <BookOpen className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Fanlar</span>
                            </Link>
                            <Link href="/admin/stats" className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-purple-500 hover:shadow-lg">
                                <TrendingUp className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Analitika</span>
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Maktab Holati</h3>
                            <Crown className="h-5 w-5 text-amber-300" />
                        </div>
                        <p className="text-sm text-blue-100 mb-6">Barcha tizimlar normal holatda ishlamoqda. Yangi testlar va o'quvchilar qo'shishga tayyor.</p>
                        <Link href="/admin/ads" className="inline-block w-full text-center rounded-lg bg-white/20 py-2 text-sm font-bold backdrop-blur-sm hover:bg-white/30 transition-all">
                            E'lon qo'shish
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
