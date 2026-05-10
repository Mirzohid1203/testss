"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, TestResult, Subject } from "@/types";
import StatsChart from "@/components/Charts";
import { Users, FileQuestion, GraduationCap, TrendingUp, Loader2, Calendar } from "lucide-react";
import { formatDistanceToNow, format, startOfDay, subDays } from "date-fns";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTests: 0,
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
                <h1 className="text-3xl font-bold text-white font-outfit">Dashboard Overview</h1>
                <p className="text-gray-400">Real-time platform statistics and activity</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl ${stat.color} p-3 text-white`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Results */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <h2 className="mb-6 text-xl font-bold text-white">Recent Activities</h2>
                    <div className="space-y-4">
                        {recentResults.length > 0 ? recentResults.map((res) => (
                            <div key={res.id} className="flex items-center justify-between rounded-xl bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${res.score / res.total >= 0.7 ? "bg-green-500" : "bg-red-500"}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{res.subjectTitle}</p>
                                        <p className="text-xs text-gray-500">Result: {res.score}/{res.total}</p>
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

                {/* Performance Chart */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <h2 className="mb-6 text-xl font-bold text-white">Performance Trend (Avg %)</h2>
                    <StatsChart
                        data={chartData}
                        type="line"
                        dataKey="val"
                        nameKey="name"
                    />
                </div>
            </div>
        </div>
    );
}
