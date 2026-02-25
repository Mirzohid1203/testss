"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject } from "@/types";
import { Plus, Trash2, Edit3, Loader2, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({ title: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
            setSubjects(data);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
            if (isEditing && currentSubject.id) {
                const { id, ...data } = currentSubject;
                await updateDoc(doc(db, "subjects", id as string), data);
                toast.success("Subject updated");
            } else {
                await addDoc(collection(db, "subjects"), {
                    ...currentSubject,
                    createdAt: Date.now()
                });
                toast.success("Subject added");
            }
            setIsModalOpen(false);
            setCurrentSubject({ title: "", description: "" });
            setIsEditing(false);
            fetchSubjects();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setBtnLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all tests for this subject too (hypothetically, you should handle that).")) return;
        try {
            await deleteDoc(doc(db, "subjects", id as string));
            toast.success("Subject deleted");
            fetchSubjects();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const openEdit = (sub: Subject) => {
        setCurrentSubject(sub);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Subjects</h1>
                    <p className="text-gray-400">Manage test categories and subjects</p>
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
                    Add Subject
                </button>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Actions</th>
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
                                <td colSpan={3} className="py-12 text-center text-gray-500">No subjects found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Edit Subject" : "New Subject"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    value={currentSubject.title}
                                    onChange={e => setCurrentSubject({ ...currentSubject, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                    value={currentSubject.description}
                                    onChange={e => setCurrentSubject({ ...currentSubject, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={btnLoading}
                                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {btnLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Save Subject"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
