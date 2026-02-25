"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Question, Subject, TestResult } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Timer from "@/components/Timer";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TestPage() {
    const { subjectId } = useParams() as { subjectId: string };
    const { user } = useAuth();
    const router = useRouter();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Subject
                const subDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subDoc.exists()) {
                    setSubject({ id: subDoc.id, ...subDoc.data() } as Subject);
                }

                // Fetch Questions
                const q = query(collection(db, "tests"), where("subjectId", "==", subjectId));
                const querySnapshot = await getDocs(q);
                const questionsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Question[];

                // Shuffle questions
                const shuffled = questionsData.sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
            } catch (error) {
                toast.error("Error loading test");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) fetchData();
    }, [subjectId]);

    const handleSubmit = async () => {
        if (isFinished) return;
        setIsFinished(true);
        setLoading(true);

        let score = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correctAnswer) {
                score++;
            }
        });

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        const result: TestResult = {
            userId: user!.uid,
            subjectId: subjectId,
            subjectTitle: subject?.title || "Unknown",
            score,
            total: questions.length,
            timeSpent,
            createdAt: Date.now(),
        };

        try {
            const docRef = await addDoc(collection(db, "results"), result);
            toast.success("Test submitted successfully!");
            router.push(`/result/${docRef.id}`);
        } catch (error) {
            toast.error("Failed to save result");
            setIsFinished(false);
            setLoading(false);
        }
    };

    if (loading && !isFinished) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
                <AlertTriangle className="mb-4 h-16 w-16 text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">No questions found</h2>
                <p className="mt-2 text-gray-400">This subject doesn't have any questions yet.</p>
                <button onClick={() => router.back()} className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white">Go Back</button>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-950 text-gray-100">
                <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/80 p-4 backdrop-blur-md">
                    <div className="mx-auto flex max-w-4xl items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white">{subject?.title}</h1>
                            <p className="text-xs text-gray-400">Question {currentIdx + 1} of {questions.length}</p>
                        </div>
                        <Timer
                            initialTime={questions.length * 60}
                            onTimeUp={handleSubmit}
                            isActive={!isFinished}
                        />
                    </div>
                    <div className="mx-auto mt-4 h-1.5 max-w-4xl overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-12">
                    <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-8 shadow-xl backdrop-blur-sm">
                        <h2 className="mb-8 text-2xl font-semibold leading-relaxed text-white">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                                    className={`flex w-full items-center justify-between rounded-2xl border p-5 transition-all ${answers[currentQuestion.id] === idx
                                            ? "border-blue-500 bg-blue-500/10 text-white"
                                            : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600"
                                        }`}
                                >
                                    <span className="text-lg">{option}</span>
                                    {answers[currentQuestion.id] === idx && (
                                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-between">
                            <button
                                disabled={currentIdx === 0}
                                onClick={() => setCurrentIdx(prev => prev - 1)}
                                className="flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-gray-800 disabled:opacity-30"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Previous
                            </button>

                            {currentIdx === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-transform active:scale-95"
                                >
                                    Finish Test
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentIdx(prev => prev + 1)}
                                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
                                >
                                    Next
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
