"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    getDocs,
    where
} from "firebase/firestore";
import { 
    Plus, 
    Trash2, 
    Users, 
    Loader2, 
    Search,
    School,
    X,
    ChevronRight,
    GraduationCap,
    TrendingUp
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SchoolClass {
    id: string;
    name: string;
    createdAt: any;
}

interface ClassUser {
    uid: string;
    email: string;
    testsTaken?: number;
    totalScore?: number;
}

export default function AdminClasses() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [newClassName, setNewClassName] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal states
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
    const [classUsers, setClassUsers] = useState<ClassUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "classes"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SchoolClass[];
            setClasses(classesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchClassUsers = async (cls: SchoolClass) => {
        setSelectedClass(cls);
        setLoadingUsers(true);
        try {
            const qUsers = query(collection(db, "users"), where("classId", "==", cls.id));
            const userSnap = await getDocs(qUsers);
            const users = userSnap.docs.map(d => ({ uid: d.id, ...d.data() } as ClassUser));

            const resultsSnap = await getDocs(collection(db, "results"));
            const allResults = resultsSnap.docs.map(d => d.data());

            const usersWithStats = users.map(u => {
                const uResults = allResults.filter(r => r.userId === u.uid && !r.isAdminResult);
                return {
                    ...u,
                    testsTaken: uResults.length,
                    totalScore: uResults.reduce((acc, r) => acc + (r.score || 0), 0)
                };
            }).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

            setClassUsers(usersWithStats);
        } catch (error: any) {
            toast.error("O'quvchilarni yuklashda xatolik: " + error.message);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setIsSubmitting(true);
        try {
            const formattedName = newClassName.trim().toUpperCase();
            
            // Check if contains at least one number AND at least one letter
            const hasNumber = /\d/.test(formattedName);
            const hasLetter = /[A-ZА-Я]/.test(formattedName);

            if (!hasNumber || !hasLetter) {
                toast.error("Sinf nomida raqam va harf qatnashishi shart! (masalan: 9-A)");
                setIsSubmitting(false);
                return;
            }

            if (classes.some(c => c.name === formattedName)) {
                toast.error("Ushbu sinf allaqachon mavjud!");
                setIsSubmitting(false);
                return;
            }

            await addDoc(collection(db, "classes"), {
                name: formattedName,
                createdAt: new Date().toISOString()
            });
            setNewClassName("");
            toast.success("Sinf muvaffaqiyatli qo'shildi!");
        } catch (error: any) {
            toast.error("Xatolik yuz berdi: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClass = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`${name} sinfini o'chirmoqchimisiz?`)) return;

        try {
            await deleteDoc(doc(db, "classes", id));
            toast.success("Sinf o'chirildi");
        } catch (error: any) {
            toast.error("O'chirishda xatolik: " + error.message);
        }
    };

    const handleClassNameChange = (value: string) => {
        let formatted = value.toUpperCase().replace(/\s+/g, ""); // Remove spaces and uppercase
        
        // Auto-hyphen logic: If it's something like "9A" or "11B", convert to "9-A" or "11-B"
        // Also handle if they are typing and just entered the letter after number
        const match = formatted.match(/^(\d+)([A-ZА-Я])$/);
        if (match) {
            formatted = `${match[1]}-${match[2]}`;
        }
        
        setNewClassName(formatted);
    };

    const filteredClasses = classes.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-outfit">Sinflar Boshqaruvi</h1>
                    <p className="text-gray-400 text-sm">Sinf ustiga bosib o'quvchilar ro'yxatini ko'ring</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
                <form onSubmit={handleAddClass} className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <School className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Sinf nomi (masalan: 9A -> 9-A)"
                            value={newClassName}
                            onChange={(e) => handleClassNameChange(e.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-gray-800/50 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all uppercase"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        Sinf Qo'shish
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Sinflarni qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-800 bg-gray-900/30 py-2.5 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredClasses.map((cls) => (
                            <div 
                                key={cls.id}
                                onClick={() => fetchClassUsers(cls)}
                                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-blue-500/50 hover:bg-gray-800/80 shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <School className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-white">{cls.name}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">O'quvchilarni ko'rish</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteClass(cls.id, cls.name, e)}
                                    className="rounded-lg p-2 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredClasses.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-800 py-12 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-700" />
                        <p className="text-gray-500">Sinflar topilmadi. Yangi sinf qo'shing!</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedClass && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClass(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-gray-800 bg-gray-900 shadow-2xl"
                        >
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
                            
                            <div className="flex items-center justify-between border-b border-gray-800 p-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
                                        <School className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedClass.name} Sinf O'quvchilari</h2>
                                        <p className="text-sm text-gray-400">Jami: {classUsers.length} ta o'quvchi</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClass(null);
                                    }}
                                    className="rounded-full bg-gray-800 p-3 text-gray-400 hover:bg-gray-700 hover:text-white transition-all cursor-pointer relative z-50 active:scale-95 shadow-lg"
                                    aria-label="Yopish"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div 
                                className="max-h-[60vh] overflow-y-auto p-8 space-y-4 custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loadingUsers ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                                        <p className="text-gray-400">O'quvchilar ro'yxati shakllanmoqda...</p>
                                    </div>
                                ) : classUsers.length > 0 ? (
                                    classUsers.map((user, idx) => (
                                        <div 
                                            key={user.uid}
                                            className="flex items-center justify-between rounded-2xl border border-gray-800/50 bg-gray-800/30 p-5 transition-all hover:bg-gray-800/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold text-blue-400">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{user.email}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                            <GraduationCap className="h-3 w-3" />
                                                            {user.testsTaken} ta test
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                            <TrendingUp className="h-3 w-3" />
                                                            {user.totalScore} ball
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-700" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-800" />
                                        <p className="text-gray-500">Ushbu sinfda hozircha o'quvchilar yo'q.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-800/50 p-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedClass(null)}
                                    className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700"
                                >
                                    Yopish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
