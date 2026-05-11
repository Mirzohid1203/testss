"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TestResult, Subject, UserProfile } from "@/types";
import StatsChart from "@/components/Charts";
import { Loader2, TrendingUp, Award, Clock, Target, Users, School, Medal, Search, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminStats() {
    const [results, setResults] = useState<TestResult[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsSnap, subjectsSnap, usersSnap, classesSnap] = await Promise.all([
                    getDocs(query(collection(db, "results"), orderBy("createdAt"))),
                    getDocs(collection(db, "subjects")),
                    getDocs(collection(db, "users")),
                    getDocs(collection(db, "classes"))
                ]);

                const activeUsers = usersSnap.docs
                    .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
                    .filter(u => 
                        u.role !== "admin" && 
                        u.role !== "superadmin" && 
                        u.email !== "mirzohidmahmutaliyev@gmail.com"
                    );

                const activeUserIds = new Set(activeUsers.map(u => u.uid));

                setResults(resultsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() } as TestResult))
                    .filter(r => !r.isAdminResult && r.total > 0 && activeUserIds.has(r.userId))
                );
                setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
                setUsers(activeUsers);
                setClasses(classesSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate user rankings
    const userRankings = users.map(user => {
        const userResults = results.filter(r => r.userId === user.uid);
        const testsTaken = userResults.length;
        const totalScore = userResults.reduce((acc, r) => acc + (r.score || 0), 0);
        const totalPossible = userResults.reduce((acc, r) => acc + (r.total || 0), 0);
        const avgAccuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

        return {
            ...user,
            testsTaken,
            totalScore,
            avgAccuracy
        };
    }).sort((a, b) => b.totalScore - a.totalScore);

    const filteredRankings = selectedClassId === "all" 
        ? userRankings 
        : userRankings.filter(u => u.classId === selectedClassId);

    // Calculate stats by subject
    const statsBySubject = subjects.map(sub => {
        const subResults = results.filter(r => r.subjectId === sub.id);
        const avgScore = subResults.length > 0
            ? Math.round((subResults.reduce((acc, r) => acc + (r.score / r.total), 0) / subResults.length) * 100)
            : 0;

        return {
            name: sub.title,
            urinishlar: subResults.length,
            ortachaBall: avgScore
        };
    }).sort((a, b) => b.urinishlar - a.urinishlar);

    const handleExportExcel = () => {
        try {
            // Prepare Leaderboard Data
            const leaderboardData = filteredRankings.map((u, idx) => ({
                "O'rin": idx + 1,
                "Email": u.email,
                "Sinf": u.className || "N/A",
                "Testlar soni": u.testsTaken,
                "Umumiy Ball": u.totalScore,
                "Aniqiq (%)": u.avgAccuracy + "%"
            }));

            // Prepare Subject Stats Data
            const subjectData = statsBySubject.map(s => ({
                "Fan nomi": s.name,
                "Jami urinishlar": s.urinishlar,
                "O'rtacha natija (%)": s.ortachaBall + "%"
            }));

            // Create Workbook
            const wb = XLSX.utils.book_new();
            
            // Add Leaderboard Sheet
            const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardData);
            XLSX.utils.book_append_sheet(wb, wsLeaderboard, "Leaderboard");

            // Add Subject Stats Sheet
            const wsSubjects = XLSX.utils.json_to_sheet(subjectData);
            XLSX.utils.book_append_sheet(wb, wsSubjects, "Fanlar Statistikasi");

            // Save File
            const fileName = selectedClassId === "all" ? "Umumiy_Statistika.xlsx" : `${classes.find(c => c.id === selectedClassId)?.name}_Statistikasi.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error("Excel export error:", error);
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-outfit">Maktab Analitikasi</h1>
                    <p className="text-gray-400">O'quvchilar natijalari va sinflar reytingi</p>
                </div>
                        </select>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 whitespace-nowrap shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        <Download className="h-4 w-4" />
                        Excelga yuklash
                    </button>
                </div>
            </div>

            {/* Top Students Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-800 p-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Medal className="text-yellow-500" />
                                {selectedClassId === "all" ? "Maktab Leaderboardi" : "Sinf Leaderboardi"}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800/30 text-xs font-semibold uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">O'rin</th>
                                        <th className="px-6 py-4">O'quvchi</th>
                                        <th className="px-6 py-4">Sinf</th>
                                        <th className="px-6 py-4">Testlar</th>
                                        <th className="px-6 py-4">Umumiy Ball</th>
                                        <th className="px-6 py-4">Aniqiq</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredRankings.slice(0, 10).map((u, idx) => (
                                        <tr key={u.uid} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                                                    idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                                    idx === 1 ? "bg-gray-300/20 text-gray-300" :
                                                    idx === 2 ? "bg-amber-600/20 text-amber-600" :
                                                    "bg-gray-800 text-gray-500"
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{u.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-400">{u.className || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{u.testsTaken}</td>
                                            <td className="px-6 py-4 font-bold text-blue-400">{u.totalScore}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold text-emerald-500">{u.avgAccuracy}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRankings.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-gray-500">Ma'lumot topilmadi</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                            <Target className="text-red-500" />
                            Sinf Faolligi
                        </h3>
                        <div className="space-y-4">
                            {classes.map(c => {
                                const classUsers = userRankings.filter(u => u.classId === c.id);
                                const totalClassScore = classUsers.reduce((acc, u) => acc + u.totalScore, 0);
                                return (
                                    <div key={c.id} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">{c.name} sinfi</span>
                                            <span className="text-white font-bold">{totalClassScore} ball</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 transition-all duration-1000" 
                                                style={{ width: `${Math.min((totalClassScore / 500) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }).slice(0, 5)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Most Popular Subjects */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Fanlar Ommabopligi</h2>
                        <TrendingUp className="text-blue-500" />
                    </div>
                    <StatsChart
                        data={statsBySubject.slice(0, 7)}
                        type="bar"
                        dataKey="urinishlar"
                        nameKey="name"
                        color="#2563eb"
                    />
                </div>

                {/* Average Scores by Subject */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">O'rtacha Ball (%)</h2>
                        <Award className="text-yellow-500" />
                    </div>
                    <StatsChart
                        data={statsBySubject.slice(0, 7)}
                        type="bar"
                        dataKey="ortachaBall"
                        nameKey="name"
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Summary Table */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-xl">
                <div className="border-b border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white">Detailed Subject Stats</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Fan nomi</th>
                            <th className="px-6 py-4">Jami urinishlar</th>
                            <th className="px-6 py-4">O'rtacha natija</th>
                            <th className="px-6 py-4">Qiyinlik darajasi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {statsBySubject.map((s) => (
                            <tr key={s.name} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                <td className="px-6 py-4 text-gray-400">{s.urinishlar}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
                                            <div
                                                className={`h-full ${s.ortachaBall >= 70 ? "bg-green-500" : s.ortachaBall >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                                style={{ width: `${s.ortachaBall}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-white">{s.ortachaBall}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${s.ortachaBall < 50 ? "bg-red-500/10 text-red-400" : s.ortachaBall < 75 ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
                                        }`}>
                                        {s.ortachaBall < 50 ? "Qiyin" : s.ortachaBall < 75 ? "O'rtacha" : "Oson"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
