"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/types";
import { Plus, Trash2, Edit3, Loader2, X, ShieldCheck, Lock, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({ 
        title: "", 
        description: "",
        allowedGrades: [] 
    });
    const [timeValue, setTimeValue] = useState<number>(60);
    const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes">("seconds");
    const [isEditing, setIsEditing] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const { t } = useLanguage();

    const availableGrades = ["5", "6", "7", "8", "9", "10", "11"];

    useEffect(() => {
        const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
            setSubjects(data);
            setLoading(false);
        }, (err) => {
            toast.error(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleGrade = (grade: string) => {
        const current = currentSubject.allowedGrades || [];
        if (current.includes(grade)) {
            setCurrentSubject({ ...currentSubject, allowedGrades: current.filter(g => g !== grade) });
        } else {
            setCurrentSubject({ ...currentSubject, allowedGrades: [...current, grade] });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setBtnLoading(true);
        const calculatedSeconds = timeUnit === "minutes" ? timeValue * 60 : timeValue;
        const dataToSave = {
            ...currentSubject,
            timePerQuestion: calculatedSeconds,
            createdAt: currentSubject.createdAt || Date.now()
        };

        try {
            if (isEditing && currentSubject.id) {
                const { id, ...data } = dataToSave;
                await updateDoc(doc(db, "subjects", id as string), data);
                toast.success(t.admin.subjects.updated);
            } else {
                await addDoc(collection(db, "subjects"), dataToSave);
                toast.success(t.admin.subjects.added);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setBtnLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.admin.subjects.confirmDelete)) return;
        try {
            await deleteDoc(doc(db, "subjects", id as string));
            toast.success(t.admin.subjects.deleted);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const resetForm = () => {
        setCurrentSubject({ title: "", description: "", allowedGrades: [] });
        setTimeValue(60);
        setTimeUnit("seconds");
        setIsEditing(false);
    };

    const openEdit = (sub: Subject) => {
        setCurrentSubject({
            ...sub,
            allowedGrades: sub.allowedGrades || []
        });
        const seconds = sub.timePerQuestion || 60;
        if (seconds % 60 === 0) {
            setTimeValue(seconds / 60);
            setTimeUnit("minutes");
        } else {
            setTimeValue(seconds);
            setTimeUnit("seconds");
        }
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const formatSubjectTime = (seconds?: number) => {
        if (!seconds) return "1 daqiqa";
        if (seconds % 60 === 0) {
            return `${seconds / 60} daqiqa`;
        }
        return `${seconds} soniya`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-outfit">{t.admin.subjects.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">{t.admin.subjects.desc}</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md w-full sm:w-auto"
                >
                    <Plus className="h-5 w-5" />
                    {t.admin.subjects.add}
                </button>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden shadow-sm">
                {/* Mobile Cards View (sm/md screens) */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800 md:hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : subjects.length > 0 ? (
                        subjects.map((sub) => (
                            <div key={sub.id} className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{sub.title}</h3>
                                        {sub.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{sub.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => openEdit(sub)}
                                            className="rounded-lg p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-colors"
                                            title={t.common.edit}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
                                            title={t.common.delete}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Vaqt va Sinflar qatori */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Vaqt:</span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatSubjectTime(sub.timePerQuestion)} / savol
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-0.5">Sinflar:</span>
                                        {sub.allowedGrades && sub.allowedGrades.length > 0 ? (
                                            sub.allowedGrades.sort((a,b)=>parseInt(a)-parseInt(b)).map(g => (
                                                <span key={g} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                                                    {g}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Lock className="h-3 w-3" /> {t.admin.subjects.noOne}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-gray-500">{t.admin.subjects.noSubjects}</div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">{t.admin.subjects.name}</th>
                                <th className="px-6 py-4">{t.admin.subjects.description}</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Vaqt (Savol boshiga)</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">{t.admin.subjects.allowedGrades}</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">{t.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                    </td>
                                </tr>
                            ) : subjects.length > 0 ? (
                                subjects.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{sub.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{sub.description}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatSubjectTime(sub.timePerQuestion)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {sub.allowedGrades && sub.allowedGrades.length > 0 ? (
                                                    sub.allowedGrades.sort((a,b)=>parseInt(a)-parseInt(b)).map(g => (
                                                        <span key={g} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20 dark:border-blue-500/30">
                                                            {g}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-1">
                                                        <Lock className="h-3 w-3" /> {t.admin.subjects.noOne}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(sub)}
                                                    className="rounded-lg p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-colors"
                                                    title={t.common.edit}
                                                >
                                                    <Edit3 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub.id)}
                                                    className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
                                                    title={t.common.delete}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">{t.admin.subjects.noSubjects}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? t.admin.subjects.edit : t.admin.subjects.new}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.admin.subjects.name}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    value={currentSubject.title}
                                    onChange={e => setCurrentSubject({ ...currentSubject, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.admin.subjects.description}</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    rows={2}
                                    value={currentSubject.description}
                                    onChange={e => setCurrentSubject({ ...currentSubject, description: e.target.value })}
                                />
                            </div>

                            {/* Custom Timer Config */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    Savol boshiga o'rtacha vaqt
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            min={1}
                                            required
                                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                                            value={timeValue}
                                            onChange={e => setTimeValue(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <select
                                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                                            value={timeUnit}
                                            onChange={e => setTimeUnit(e.target.value as "seconds" | "minutes")}
                                        >
                                            <option value="seconds">Sekund</option>
                                            <option value="minutes">Daqiqa</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    Test davomida umumiy vaqt savollar soniga ko'paytirilib belgilanadi.
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    {t.admin.subjects.allowedGrades}
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableGrades.map((grade) => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => toggleGrade(grade)}
                                            className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                                                currentSubject.allowedGrades?.includes(grade)
                                                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-[10px] text-gray-500 italic">{t.admin.subjects.gradeWarning}</p>
                            </div>
                            <button
                                type="submit"
                                disabled={btnLoading}
                                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-98 shadow-md"
                            >
                                {btnLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t.common.save}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
