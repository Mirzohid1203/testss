"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TestResult } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Loader2, Trophy, Clock, Target, Home, RefreshCw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResultPage() {
    const { resultId } = useParams() as { resultId: string };
    const [result, setResult] = useState<TestResult | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const docSnap = await getDoc(doc(db, "results", resultId));
                if (docSnap.exists()) {
                    setResult({ id: docSnap.id, ...docSnap.data() } as TestResult);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (resultId) fetchResult();
    }, [resultId]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-950">
                <h2 className="text-2xl font-bold text-white">Result not found</h2>
                <Link href="/dashboard" className="mt-4 text-blue-500 underline">Back to Dashboard</Link>
            </div>
        );
    }

    const percentage = Math.round((result.score / result.total) * 100);
    const isPassed = percentage >= 70;

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 shadow-2xl backdrop-blur-xl"
                >
                    <div className={`h-4 ${isPassed ? "bg-green-500" : "bg-red-500"}`} />

                    <div className="p-8 text-center sm:p-12">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
                            {isPassed ? (
                                <Trophy className="h-12 w-12 text-yellow-500" />
                            ) : (
                                <Target className="h-12 w-12 text-blue-500" />
                            )}
                        </div>

                        <h1 className="text-4xl font-extrabold text-white">
                            {isPassed ? "Congratulations!" : "Keep Practicing!"}
                        </h1>
                        <p className="mt-2 text-lg text-gray-400">
                            You completed the <span className="text-blue-400 font-semibold">{result.subjectTitle}</span> test.
                        </p>

                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="rounded-2xl bg-gray-800/50 p-6">
                                <div className="text-sm font-medium text-gray-400">Score</div>
                                <div className="mt-1 text-3xl font-bold text-white">
                                    {result.score} <span className="text-xl font-normal text-gray-600">/ {result.total}</span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gray-800/50 p-6">
                                <div className="text-sm font-medium text-gray-400">Accuracy</div>
                                <div className={`mt-1 text-3xl font-bold ${isPassed ? "text-green-500" : "text-red-500"}`}>
                                    {percentage}%
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gray-800/50 p-6">
                                <div className="text-sm font-medium text-gray-400">Time Spent</div>
                                <div className="flex items-center justify-center mt-1 text-3xl font-bold text-white">
                                    <Clock className="mr-2 h-6 w-6 text-blue-500" />
                                    {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/dashboard"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-4 font-bold text-white transition-all hover:bg-gray-700 sm:w-auto"
                            >
                                <Home className="h-5 w-5" />
                                Dashboard
                            </Link>
                            <Link
                                href={`/test/${result.subjectId}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/40 sm:w-auto"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Try Again
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </ProtectedRoute>

    );
}
