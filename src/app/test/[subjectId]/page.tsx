"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Question, Subject, TestResult, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Timer from "@/components/Timer";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { FileQuestion, Loader2, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestPage() {
    const { subjectId } = useParams() as { subjectId: string };
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime] = useState(Date.now());

    const [hasAttempted, setHasAttempted] = useState(false);
    const [canRetake, setCanRetake] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;

                // Check if user already has a result for THIS subject
                const resultsQuery = query(
                    collection(db, "results"),
                    where("userId", "==", user.uid),
                    where("subjectId", "==", subjectId)
                );
                const resultsSnap = await getDocs(resultsQuery);
                const attempted = !resultsSnap.empty;
                setHasAttempted(attempted);

                // Check if admin allowed a retake
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data() as UserProfile;
                const retakeAllowed = userData.retakeAllowed?.includes(subjectId);
                setCanRetake(!!retakeAllowed);

                if (attempted && !retakeAllowed && !isAdmin) {
                    setLoading(false);
                    return;
                }

                // Fetch Subject
                const subDoc = await getDoc(doc(db, "subjects", subjectId));
                if (subDoc.exists()) {
                    setSubject({ id: subDoc.id, ...subDoc.data() } as Subject);
                }

                // Get student's grade level
                let studentGrade = "9";
                if (profile?.className) {
                    const match = profile.className.match(/\d+/);
                    if (match) studentGrade = match[0];
                }

                const q = query(
                    collection(db, "tests"), 
                    where("subjectId", "==", subjectId),
                    where("gradeLevel", "==", studentGrade)
                );
                
                const querySnapshot = await getDocs(q);
                const questionsData = querySnapshot.docs.map(doc => {
                    const data = doc.data() as Question;
                    // Options va CorrectAnswer ni shuffle qilish
                    const originalOptions = [...data.options];
                    const correctAnswerText = originalOptions[data.correctAnswer];
                    
                    const shuffledOptions = originalOptions
                        .map((value) => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value);
                    
                    const newCorrectAnswer = shuffledOptions.indexOf(correctAnswerText);

                    return {
                        ...data,
                        id: doc.id,
                        options: shuffledOptions,
                        correctAnswer: newCorrectAnswer
                    } as Question;
                }) as Question[];

                // Savollarni o'zini ham shuffle qilish
                const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5);
                setQuestions(shuffledQuestions);
            } catch (error) {
                toast.error(t.test.loading);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectId && (user || isAdmin)) fetchData();
    }, [subjectId, user, profile, isAdmin]);

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

        const result = {
            userId: user!.uid,
            subjectId: subjectId,
            subjectTitle: subject?.title || "Unknown",
            score,
            total: questions.length,
            timeSpent,
            createdAt: Date.now(),
            isAdminResult: isAdmin,
            userAnswers: answers // Store all user answers
        };

        try {
            // Delete old results for this user and subject to only keep the latest one
            const oldResultsQuery = query(
                collection(db, "results"),
                where("userId", "==", user!.uid),
                where("subjectId", "==", subjectId)
            );
            const oldResultsSnap = await getDocs(oldResultsQuery);
            const deletePromises = oldResultsSnap.docs.map(d => deleteDoc(doc(db, "results", d.id)));
            await Promise.all(deletePromises);

            const docRef = await addDoc(collection(db, "results"), result);
            
            // If it was a retake, remove the permission now that it's used
            if (canRetake) {
                const userRef = doc(db, "users", user!.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data() as UserProfile;
                const newRetakeAllowed = (userData.retakeAllowed || []).filter((id: string) => id !== subjectId);
                await updateDoc(userRef, { retakeAllowed: newRetakeAllowed });
            }

            toast.success(t.test.success);
            router.push(`/result/${docRef.id}`);
        } catch (error) {
            toast.error(t.test.error);
            setIsFinished(false);
            setLoading(false);
        }
    };

    if (loading && !isFinished) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-400 font-medium">{t.test.loading}</p>
                </div>
            </div>
        );
    }

    if (hasAttempted && !canRetake && !isAdmin) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight font-outfit uppercase">{t.test.forbidden}</h2>
                <p className="mt-4 max-w-md text-gray-400 leading-relaxed text-lg">
                    {t.test.attempted}
                </p>
                <button 
                    onClick={() => router.push('/dashboard')} 
                    className="mt-8 rounded-2xl bg-white/5 border border-white/10 px-10 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95 shadow-xl"
                >
                    {t.test.backDashboard}
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mb-6 border border-amber-500/20">
                    <FileQuestion className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight font-outfit uppercase">{t.test.noQuestions}</h2>
                <p className="mt-2 text-gray-400">{t.test.noQuestionsDesc}</p>
                <button onClick={() => router.back()} className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">{t.test.back}</button>
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
                            <p className="text-xs text-gray-400">{currentIdx + 1}-{t.test.question}, {t.test.of} {questions.length}</p>
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
                                {t.test.previous}
                            </button>

                            {currentIdx === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-transform active:scale-95"
                                >
                                    {t.test.finish}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentIdx(prev => prev + 1)}
                                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-gray-700 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
                                >
                                    {t.test.next}
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
