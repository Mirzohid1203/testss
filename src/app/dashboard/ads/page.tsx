"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Megaphone, Calendar, ArrowRight, X } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Ad {
    id: string;
    title: string;
    content: string;
    createdAt: any;
}

export default function UserAds() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
        <ProtectedRoute>
            <div className="min-h-[calc(100vh-64px)] bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-600/20 mb-4">
                            <Megaphone className="h-4 w-4" />
                            {t.nav.ads}
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            {t.nav.ads}
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            {t.adsPage.subtitle}
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        </div>
                    ) : ads.length > 0 ? (
                        <div className="grid gap-8">
                            <AnimatePresence mode="popLayout">
                                {ads.map((ad, index) => (
                                    <motion.div
                                        key={ad.id}
                                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="group relative overflow-hidden rounded-[2rem] border border-gray-800 bg-gray-900/30 p-8 shadow-2xl backdrop-blur-md transition-all hover:border-blue-500/40 hover:bg-gray-900/50"
                                    >
                                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/5 blur-[100px] transition-all group-hover:bg-blue-600/10" />
                                        
                                        <div className="relative flex flex-col md:flex-row md:items-start gap-8">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                                                <Megaphone className="h-8 w-8" />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {ad.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-gray-400 border border-white/5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {safeFormatDate(ad.createdAt)}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-lg leading-relaxed text-gray-300 font-medium line-clamp-3">
                                                    {ad.content}
                                                </p>
                                                
                                                <button
                                                    onClick={() => setSelectedAd(ad)}
                                                    className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:translate-x-2 transition-transform duration-300"
                                                >
                                                    <span>{t.adsPage.readMore}</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-800 bg-gray-900/20 py-24 text-center"
                        >
                            <div className="rounded-3xl bg-gray-800/50 p-6 mb-6">
                                <Megaphone className="h-12 w-12 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{t.adsPage.noAds}</h3>
                            <p className="mt-3 text-gray-400 max-w-sm mx-auto text-lg">
                                {t.adsPage.noAdsDesc}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Ad Modal */}
            <AnimatePresence>
                {selectedAd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedAd(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative max-w-2xl w-full overflow-hidden rounded-[2.5rem] border border-gray-800 bg-gray-900 p-8 shadow-2xl md:p-12"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
                            
                            <button
                                onClick={() => setSelectedAd(null)}
                                className="absolute right-6 top-6 rounded-full bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white z-10"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="relative">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
                                    <Megaphone className="h-8 w-8" />
                                </div>
                                
                                <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-blue-400">
                                    <Calendar className="h-4 w-4" />
                                    {safeFormatDate(selectedAd.createdAt)}
                                </div>
                                
                                <h2 className="mb-6 text-3xl font-extrabold text-white md:text-4xl">
                                    {selectedAd.title}
                                </h2>
                                
                                <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                                    <p className="text-lg leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">
                                        {selectedAd.content}
                                    </p>
                                </div>
                                
                                <div className="mt-10">
                                    <button
                                        onClick={() => setSelectedAd(null)}
                                        className="w-full rounded-2xl bg-blue-600 py-4 text-center text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                                    >
                                        {t.adsPage.close}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}
