"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Megaphone, Trash2, Plus, Calendar, Edit2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface Ad {
    id: string;
    title: string;
    content: string;
    createdAt: number;
}

export default function AdminAds() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAd, setNewAd] = useState({ title: "", content: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAd.title.trim() || !newAd.content.trim()) {
            toast.error(t.admin.ads.fillFields);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing ad
                await updateDoc(doc(db, "ads", editingId), {
                    title: newAd.title,
                    content: newAd.content
                });
                toast.success(t.admin.ads.updated);
            } else {
                // Add new ad
                await addDoc(collection(db, "ads"), {
                    ...newAd,
                    createdAt: Date.now()
                });
                toast.success(t.admin.ads.added);
            }
            handleCancelEdit();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (ad: Ad) => {
        setEditingId(ad.id);
        setNewAd({ title: ad.title, content: ad.content });
        // Scroll to form on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewAd({ title: "", content: "" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.admin.ads.confirmDelete)) return;
        try {
            await deleteDoc(doc(db, "ads", id));
            toast.success(t.admin.ads.deleted);
            if (editingId === id) handleCancelEdit();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const safeFormatDate = (dateVal: any) => {
        if (!dateVal) return "N/A";
        try {
            const date = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
            if (isNaN(date.getTime())) return "N/A";
            return format(date, "MMM d, yyyy HH:mm");
        } catch (e) {
            return "N/A";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">{t.admin.ads.title}</h1>
                <p className="text-gray-400">{t.admin.ads.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl sticky top-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
                                {editingId ? t.admin.ads.editAd : t.admin.ads.newAd}
                            </h2>
                            {editingId && (
                                <button 
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="rounded-full p-1 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-400">{t.admin.ads.adTitle}</label>
                                <input
                                    type="text"
                                    value={newAd.title}
                                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                                    placeholder={t.admin.ads.placeholderTitle}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-400">{t.admin.ads.adContent}</label>
                                <textarea
                                    value={newAd.content}
                                    onChange={(e) => setNewAd({ ...newAd, content: e.target.value })}
                                    className="h-32 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                                    placeholder={t.admin.ads.placeholderContent}
                                />
                            </div>
                            <div className="flex gap-2">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
                                    >
                                        {t.common.cancel}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 ${editingId ? "bg-amber-600 hover:bg-amber-700 flex-[2]" : "bg-blue-600 hover:bg-blue-700 w-full"}`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        editingId ? t.common.save : t.admin.ads.publish
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/50">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : ads.length > 0 ? (
                        ads.map((ad) => (
                            <div 
                                key={ad.id} 
                                className={`relative rounded-2xl border p-6 shadow-lg transition-all ${editingId === ad.id ? "border-amber-500/50 bg-amber-500/5 shadow-amber-500/10 scale-[1.02]" : "border-gray-800 bg-gray-900/50 hover:border-gray-700"}`}
                            >
                                <div className="absolute right-4 top-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(ad)}
                                        className={`rounded-lg p-2 transition-colors ${editingId === ad.id ? "text-amber-500 bg-amber-500/10" : "text-gray-500 hover:text-amber-500 hover:bg-amber-500/10"}`}
                                        title={t.common.edit}
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ad.id)}
                                        className="rounded-lg p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        title={t.common.delete}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-3 ${editingId === ad.id ? "bg-amber-500/20 text-amber-500" : "bg-blue-600/20 text-blue-400"}`}>
                                        <Megaphone className="h-6 w-6" />
                                    </div>
                                    <div className="pr-20">
                                        <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
                                        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{ad.content}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {safeFormatDate(ad.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/50 text-gray-500">
                            <Megaphone className="mb-2 h-8 w-8 opacity-50" />
                            <p>{t.admin.ads.noAds}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
