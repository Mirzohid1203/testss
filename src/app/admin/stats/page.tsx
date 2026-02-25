"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TestResult, Subject } from "@/types";
import StatsChart from "@/components/Charts";
import { Loader2, TrendingUp, Award, Clock, Target } from "lucide-react";

export default function AdminStats() {
    const [results, setResults] = useState<TestResult[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsSnap, subjectsSnap] = await Promise.all([
                    getDocs(query(collection(db, "results"), orderBy("createdAt"))),
                    getDocs(collection(db, "subjects"))
                ]);

                setResults(resultsSnap.docs.map(d => d.data() as TestResult));
                setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate stats by subject
    const statsBySubject = subjects.map(sub => {
        const subResults = results.filter(r => r.subjectId === sub.id);
        const avgScore = subResults.length > 0
            ? Math.round((subResults.reduce((acc, r) => acc + (r.score / r.total), 0) / subResults.length) * 100)
            : 0;

        return {
            name: sub.title,
            attempts: subResults.length,
            avgScore
        };
    }).sort((a, b) => b.attempts - a.attempts);

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
                <h1 className="text-3xl font-bold text-white">Advanced Statistics</h1>
                <p className="text-gray-400">Deep dive into test performance across subjects</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Most Popular Subjects */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Popularity by Attempts</h2>
                        <TrendingUp className="text-blue-500" />
                    </div>
                    <StatsChart
                        data={statsBySubject.slice(0, 7)}
                        type="bar"
                        dataKey="attempts"
                        nameKey="name"
                        color="#2563eb"
                    />
                </div>

                {/* Average Scores by Subject */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Avg. Score (%) by Subject</h2>
                        <Award className="text-yellow-500" />
                    </div>
                    <StatsChart
                        data={statsBySubject.slice(0, 7)}
                        type="bar"
                        dataKey="avgScore"
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
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Total Attempts</th>
                            <th className="px-6 py-4">Average Score</th>
                            <th className="px-6 py-4">Difficulty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {statsBySubject.map((s) => (
                            <tr key={s.name} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                <td className="px-6 py-4 text-gray-400">{s.attempts}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
                                            <div
                                                className={`h-full ${s.avgScore >= 70 ? "bg-green-500" : s.avgScore >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                                style={{ width: `${s.avgScore}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-white">{s.avgScore}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${s.avgScore < 50 ? "bg-red-500/10 text-red-400" : s.avgScore < 75 ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
                                        }`}>
                                        {s.avgScore < 50 ? "Hard" : s.avgScore < 75 ? "Medium" : "Easy"}
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
