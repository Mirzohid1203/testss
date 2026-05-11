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
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const docSnap = await getDoc(doc(db, "results", resultId));
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as any;
                    setResult(data);

                    // Fetch questions to show review
                    const q = query(
                        collection(db, "tests"),
                        where("subjectId", "==", data.subjectId)
                    );
                    const qSnap = await getDocs(q);
                    setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
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
            <div className="flex h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
                <h2 className="text-2xl font-bold text-white">Natija topilmadi</h2>
                <Link href="/dashboard" className="mt-4 text-blue-500 underline">Dashboardga qaytish</Link>
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
                    <div className={`h-4 ${isPassed ? "bg-emerald-500" : "bg-red-500"}`} />

                    <div className="p-8 text-center sm:p-12">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 shadow-inner">
                            {isPassed ? (
                                <Trophy className="h-12 w-12 text-yellow-500 drop-shadow-lg" />
                            ) : (
                                <Target className="h-12 w-12 text-blue-500 drop-shadow-lg" />
                            )}
                        </div>

                        <h1 className="text-4xl font-black text-white tracking-tight font-outfit uppercase">
                            {isPassed ? "Tabriklaymiz!" : "Yana urinib ko'ring!"}
                        </h1>
                        <p className="mt-2 text-lg text-gray-400">
                            Siz <span className="text-blue-400 font-bold">{result.subjectTitle}</span> fanidan testni yakunladingiz.
                        </p>

                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Natija</div>
                                <div className="mt-1 text-3xl font-black text-white">
                                    {result.score} <span className="text-xl font-normal text-gray-600">/ {result.total}</span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Foiz</div>
                                <div className={`mt-1 text-3xl font-black ${isPassed ? "text-emerald-500" : "text-red-500"}`}>
                                    {percentage}%
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sarflangan vaqt</div>
                                <div className="flex items-center justify-center mt-1 text-3xl font-black text-white">
                                    <Clock className="mr-2 h-6 w-6 text-blue-500" />
                                    {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/dashboard"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-4 font-bold text-white transition-all hover:bg-gray-800 sm:w-auto active:scale-95"
                            >
                                <Home className="h-5 w-5" />
                                Bosh sahifa
                            </Link>
                            <button
                                onClick={() => setShowReview(!showReview)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 px-6 py-4 font-bold text-white transition-all hover:bg-white/20 sm:w-auto active:scale-95"
                            >
                                <RefreshCw className={`h-5 w-5 transition-transform ${showReview ? "rotate-180" : ""}`} />
                                {showReview ? "Tahlilni yopish" : "Xatolarni ko'rish"}
                            </button>
                            <Link
                                href={`/test/${result.subjectId}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 sm:w-auto active:scale-95"
                            >
                                <ChevronRight className="h-5 w-5" />
                                Qayta topshirish
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Review Section */}
                {showReview && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 space-y-6"
                    >
                        <h2 className="text-2xl font-black text-white tracking-tight font-outfit uppercase text-center mb-8">
                            Xatolar Ustida <span className="text-blue-500">Ishlash</span>
                        </h2>
                        
                        {questions.map((q, idx) => {
                            const userAnswer = result.userAnswers?.[q.id];
                            const isCorrect = userAnswer === q.correctAnswer;
                            
                            return (
                                <div 
                                    key={q.id} 
                                    className={`rounded-3xl border p-6 transition-all backdrop-blur-sm ${
                                        isCorrect 
                                        ? "border-emerald-500/30 bg-emerald-500/5" 
                                        : "border-red-500/30 bg-red-500/5"
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                                            isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-bold text-white mb-4 leading-relaxed">{q.question}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, optIdx) => {
                                                    const isUserSelected = userAnswer === optIdx;
                                                    const isCorrectOpt = q.correctAnswer === optIdx;
                                                    
                                                    let bgColor = "bg-white/5 border-white/10";
                                                    if (isCorrectOpt) bgColor = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                                                    if (isUserSelected && !isCorrectOpt) bgColor = "bg-red-500/20 border-red-500/50 text-red-400";

                                                    return (
                                                        <div 
                                                            key={optIdx} 
                                                            className={`rounded-xl border p-3 text-sm font-medium transition-all ${bgColor}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                                                {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                                {isUserSelected && !isCorrectOpt && <Target className="h-4 w-4 text-red-500" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {!isCorrect && (
                                                <p className="mt-4 text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Sizning javobingiz noto'g'ri
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </main>
        </ProtectedRoute>

    );
}
