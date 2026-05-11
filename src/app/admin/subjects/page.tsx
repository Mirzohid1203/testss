"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/types";
import { Plus, Trash2, Edit3, Loader2, Search, X, ShieldCheck, Lock } from "lucide-react";
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
        try {
            if (isEditing && currentSubject.id) {
                const { id, ...data } = currentSubject;
                await updateDoc(doc(db, "subjects", id as string), data);
                toast.success(t.admin.subjects.updated);
            } else {
                await addDoc(collection(db, "subjects"), {
                    ...currentSubject,
                    createdAt: Date.now()
                });
                toast.success(t.admin.subjects.added);
            }
            setIsModalOpen(false);
            setCurrentSubject({ title: "", description: "", allowedGrades: [] });
            setIsEditing(false);
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

    const openEdit = (sub: Subject) => {
        setCurrentSubject({
            ...sub,
            allowedGrades: sub.allowedGrades || []
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t.admin.subjects.title}</h1>
                    <p className="text-gray-400">{t.admin.subjects.desc}</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentSubject({ title: "", description: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    {t.admin.subjects.add}
                </button>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">{t.admin.subjects.name}</th>
                            <th className="px-6 py-4">{t.admin.subjects.description}</th>
                            <th className="px-6 py-4 text-center">{t.admin.subjects.allowedGrades}</th>
                            <th className="px-6 py-4 text-right">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="py-12 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : subjects.length > 0 ? (
                            subjects.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{sub.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{sub.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {sub.allowedGrades && sub.allowedGrades.length > 0 ? (
                                                sub.allowedGrades.sort((a,b)=>parseInt(a)-parseInt(b)).map(g => (
                                                    <span key={g} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                                                        {g}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                                    <Lock className="h-3 w-3" /> Hech kimga
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(sub)}
                                                className="rounded-lg p-2 text-blue-400 hover:bg-blue-400/10"
                                            >
                                                <Edit3 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="rounded-lg p-2 text-red-400 hover:bg-red-400/10"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-500">{t.admin.subjects.noSubjects}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? t.admin.subjects.edit : t.admin.subjects.new}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t.admin.subjects.name}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    value={currentSubject.title}
                                    onChange={e => setCurrentSubject({ ...currentSubject, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t.admin.subjects.description}</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    rows={2}
                                    value={currentSubject.description}
                                    onChange={e => setCurrentSubject({ ...currentSubject, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
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
                                                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-[10px] text-gray-500 italic">* Agar hech qaysi sinf tanlanmasa, bu fan hech kimga ko'rinmaydi.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={btnLoading}
                                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
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
