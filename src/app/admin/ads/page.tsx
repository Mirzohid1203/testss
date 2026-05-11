"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Megaphone, Trash2, Plus, Calendar } from "lucide-react";
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
    const { t } = useLanguage();

    useEffect(() => {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAd.title.trim() || !newAd.content.trim()) {
            toast.error(t.admin.ads.fillFields);
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "ads"), {
                ...newAd,
                createdAt: Date.now()
            });
            toast.success(t.admin.ads.added);
            setNewAd({ title: "", content: "" });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.admin.ads.confirmDelete)) return;
        try {
            await deleteDoc(doc(db, "ads", id));
            toast.success(t.admin.ads.deleted);
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
                    <form onSubmit={handleAddAd} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-xl">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                            <Plus className="h-5 w-5 text-blue-500" />
                            {t.admin.ads.newAd}
                        </h2>
                        
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
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t.admin.ads.publish}
                            </button>
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
                            <div key={ad.id} className="relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 shadow-lg transition-all hover:border-gray-700">
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-blue-600/20 p-3 text-blue-400">
                                        <Megaphone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
                                        <p className="mt-1 text-sm text-gray-300">{ad.content}</p>
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
