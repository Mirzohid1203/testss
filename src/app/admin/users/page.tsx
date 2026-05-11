"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, TestResult } from "@/types";
import { Loader2, User, Mail, Calendar, Shield, Crown, BarChart3, X, Search, ChevronRight, Trash2, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserWithStats extends UserProfile {
    testsTaken: number;
    totalScore: number;
    rank?: number;
    results: TestResult[];
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
    const { isSuperAdmin } = useAuth();

    useEffect(() => {
        const fetchUsersAndStats = async () => {
            try {
                // Fetch all results first for stats
                const resultsSnap = await getDocs(collection(db, "results"));
                // FILTER: Exclude admin results from general stats
                const results = resultsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as TestResult))
                    .filter(r => !r.isAdminResult);

                // Fetch classes
                const classesSnap = await getDocs(collection(db, "classes"));
                setClasses(classesSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

                // Listen to users
                const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    let usersData = snapshot.docs
                        .map(doc => {
                            const userData = doc.data() as UserProfile;
                            const userResults = results.filter(r => r.userId === userData.uid);
                            
                            // STATS FILTER: Only show stats for regular users
                            const isUser = userData.role === "user";
                            const testsTaken = isUser ? userResults.length : 0;
                            const totalScore = isUser ? userResults.reduce((acc, curr) => acc + (curr.score || 0), 0) : 0;
                            
                            return {
                                ...userData,
                                testsTaken,
                                totalScore,
                                results: userResults
                            };
                        }); // Removed the role filter to show everyone again

                    // Sort by testsTaken descending, then totalScore
                    usersData.sort((a, b) => {
                        if (b.testsTaken !== a.testsTaken) return b.testsTaken - a.testsTaken;
                        return b.totalScore - a.totalScore;
                    });

                    // Assign rank
                    usersData = usersData.map((u, idx) => ({ ...u, rank: idx + 1 }));

                    setUsers(usersData);
                    setLoading(false);
                });
                return unsubscribe;
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        let unsub: any;
        fetchUsersAndStats().then(res => { unsub = res; });
        return () => { if (unsub) unsub(); };
    }, []);

    const handleRoleChange = async (uid: string, e: React.MouseEvent, newRole: string) => {
        e.stopPropagation();
        if (!isSuperAdmin) return;
        
        const currentUser = users.find(u => u.uid === uid);
        if (!currentUser) return;

        // Agar rol o'zgarmagan bo'lsa, hech narsa qilma
        if (currentUser.role === newRole) return;

        try {
            const updateData: any = { role: newRole };
            
            // 1. User -> Admin o'tayotgan bo'lsa: Hozirgi sinfini "Zahira"ga olamiz
            if (newRole === "admin" && currentUser.role === "user") {
                // Faqat sinfi bor bo'lsagina zahira olamiz
                if (currentUser.classId) {
                    updateData.prevClassId = currentUser.classId;
                    updateData.prevClassName = currentUser.className;
                }
                updateData.classId = "";
                updateData.className = "";
            } 
            
            // 2. Admin -> User qaytayotgan bo'lsa: Zahiradan sinfni tiklaymiz
            else if (newRole === "user" && currentUser.role === "admin") {
                if (currentUser.prevClassId) {
                    updateData.classId = currentUser.prevClassId;
                    updateData.className = currentUser.prevClassName;
                    // Tiklangandan so'ng zahirani tozalash (ixtiyoriy)
                    updateData.prevClassId = "";
                    updateData.prevClassName = "";
                }
            }

            await updateDoc(doc(db, "users", uid), updateData);
            toast.success("Foydalanuvchi roli va sinf ma'lumotlari yangilandi");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleClassChange = async (uid: string, e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        if (!isSuperAdmin) return;
        const classId = e.target.value;
        const className = e.target.options[e.target.selectedIndex].text;

        try {
            await updateDoc(doc(db, "users", uid), { classId, className });
            toast.success("Sinf muvaffaqiyatli biriktirildi");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteUser = async (uid: string, email: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSuperAdmin) return;
        
        const confirmed = window.confirm(`Are you sure you want to delete user ${email} and ALL their test results? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            // 1. Delete all results for this user
            const resultsSnap = await getDocs(query(collection(db, "results")));
            const userResults = resultsSnap.docs.filter(d => d.data().userId === uid);
            
            const deletePromises = userResults.map(resDoc => deleteDoc(doc(db, "results", resDoc.id)));
            await Promise.all(deletePromises);

            // 2. Delete user profile
            await deleteDoc(doc(db, "users", uid));
            
            toast.success("User and all results deleted successfully");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleClearAllResults = async () => {
        if (!isSuperAdmin) return;
        const confirmed = window.confirm("DIQQAT! Barcha o'quvchilarning hamma natijalarini o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi!");
        if (!confirmed) return;

        setLoading(true);
        try {
            const resultsSnap = await getDocs(collection(db, "results"));
            const deletePromises = resultsSnap.docs.map(resDoc => deleteDoc(doc(db, "results", resDoc.id)));
            await Promise.all(deletePromises);
            toast.success("Barcha natijalar muvaffaqiyatli o'chirildi!");
            // Refresh will happen automatically due to onSnapshot if any results are being watched
            window.location.reload(); // Hard refresh to clear everything
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getUserSubjectStats = (user: UserWithStats) => {
        const stats: Record<string, { subjectId: string, title: string, count: number, avgScore: number }> = {};
        user.results.forEach(r => {
            if (!stats[r.subjectId]) {
                stats[r.subjectId] = { subjectId: r.subjectId, title: r.subjectTitle, count: 0, avgScore: 0 };
            }
            stats[r.subjectId].count++;
            stats[r.subjectId].avgScore += (r.score / r.total) * 100;
        });

        return Object.values(stats).map(s => ({
            ...s,
            avgScore: Math.round(s.avgScore / s.count)
        }));
    };

    const handleGrantRetake = async (userId: string, subjectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDocs(query(collection(db, "users")));
            const userData = userSnap.docs.find(d => d.id === userId)?.data() as UserProfile;
            const retakeAllowed = userData.retakeAllowed || [];
            
            if (!retakeAllowed.includes(subjectId)) {
                await updateDoc(userRef, {
                    retakeAllowed: [...retakeAllowed, subjectId]
                });
                toast.success("Qayta topshirishga ruxsat berildi!");
                
                // Update local state to reflect change immediately
                setUsers(prev => prev.map(u => {
                    if (u.uid === userId) {
                        return { ...u, retakeAllowed: [...retakeAllowed, subjectId] };
                    }
                    return u;
                }));

                // Also update selectedUser if open
                if (selectedUser && selectedUser.uid === userId) {
                    setSelectedUser({ ...selectedUser, retakeAllowed: [...retakeAllowed, subjectId] });
                }
            } else {
                toast.error("Bu fan uchun allaqachon ruxsat berilgan");
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const safeFormatDate = (dateVal: any) => {
        if (!dateVal) return "N/A";
        try {
            const date = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
            if (isNaN(date.getTime())) return "N/A";
            return format(date, "MMM d, yyyy");
        } catch (e) {
            return "N/A";
        }
    };

    const handleExportUserStats = (user: UserWithStats) => {
        try {
            const subjectStats = getUserSubjectStats(user);
            const data = subjectStats.map(s => ({
                "Fan nomi": s.title,
                "Testlar soni": s.count,
                "O'rtacha natija (%)": s.avgScore + "%"
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Natijalar");
            
            XLSX.writeFile(wb, `${user.email}_statistikasi.xlsx`);
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users & Leaderboard</h1>
                    <p className="text-gray-400">View and manage platform members</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {isSuperAdmin && (
                        <button
                            onClick={handleClearAllResults}
                            className="flex items-center gap-2 rounded-xl bg-red-600/10 border border-red-500/20 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Trash2 className="h-4 w-4" />
                            Natijalarni tozalash
                        </button>
                    )}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users by email or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-gray-900/50 py-2.5 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-x-auto shadow-xl">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-800/80 text-xs font-semibold uppercase text-gray-500 whitespace-nowrap">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Sinf</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Tests Taken</th>
                            <th className="px-6 py-4">Total Score</th>
                            <th className="px-6 py-4">Joined At</th>
                            {isSuperAdmin && <th className="px-6 py-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user, idx) => (
                                <tr 
                                    key={user.uid || `user-${idx}`} 
                                    onClick={() => setSelectedUser(user)}
                                    className="hover:bg-gray-800/60 transition-all cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 font-bold text-gray-300 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                            #{user.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{user.email}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.uid}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(user.role === "admin" || user.role === "superadmin") ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                                                Nazoratchi
                                            </span>
                                        ) : (
                                            <select
                                                value={user.classId || ""}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleClassChange(user.uid, e)}
                                                className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">Sinfni tanlang</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                user.role === "superadmin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                user.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}>
                                                {user.role === "superadmin" && <Crown className="h-3 w-3" />}
                                                {user.role === "admin" && <Shield className="h-3 w-3" />}
                                                {user.role}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-white">{user.testsTaken}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-white">{user.totalScore}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {safeFormatDate(user.createdAt)}
                                            </div>
                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="px-6 py-4">
                                            {user.role !== "superadmin" && (
                                                <button
                                                    onClick={(e) => handleDeleteUser(user.uid, user.email, e)}
                                                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Statistics Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-gray-800 bg-gray-900 shadow-2xl"
                        >
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
                            
                            <div className="flex items-center justify-between border-b border-gray-800 p-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">User Statistics</h2>
                                        <p className="text-sm text-gray-400">
                                            {selectedUser.email} • {(selectedUser.role === "admin" || selectedUser.role === "superadmin") ? "Nazoratchi" : (selectedUser.className || "No Class")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleExportUserStats(selectedUser)}
                                    className="mr-2 rounded-full bg-emerald-600/20 p-2.5 text-emerald-400 hover:bg-emerald-600/30 transition-all cursor-pointer relative z-50 active:scale-90"
                                    title="Excelga yuklash"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(null);
                                    }}
                                    className="rounded-full bg-gray-800 p-2.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-all cursor-pointer relative z-50 active:scale-90"
                                    aria-label="Yopish"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div 
                                className="p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="rounded-2xl bg-gray-800/50 p-4 border border-gray-800">
                                        <p className="text-sm text-gray-500 font-medium">Total Tests</p>
                                        <p className="text-2xl font-bold text-white">{selectedUser.testsTaken}</p>
                                    </div>
                                    <div className="rounded-2xl bg-gray-800/50 p-4 border border-gray-800">
                                        <p className="text-sm text-gray-500 font-medium">Total Score</p>
                                        <p className="text-2xl font-bold text-blue-400">{selectedUser.totalScore}</p>
                                    </div>
                                </div>

                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Performance by Subject</h3>
                                
                                <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {getUserSubjectStats(selectedUser).length > 0 ? (
                                        getUserSubjectStats(selectedUser).map((stat, idx) => (
                                            <div key={stat.subjectId || `stat-${idx}`} className="flex items-center justify-between rounded-xl bg-gray-800/30 p-4 border border-gray-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{stat.title}</p>
                                                        <p className="text-xs text-gray-500">{stat.count} test(s) completed</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right mr-3">
                                                        <p className="text-lg font-bold text-white">{stat.avgScore}%</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Avg. Accuracy</p>
                                                    </div>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={(e) => handleGrantRetake(selectedUser.uid, stat.subjectId, e)}
                                                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90 ${
                                                                selectedUser.retakeAllowed?.includes(stat.subjectId)
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 cursor-default"
                                                                : "bg-blue-600/10 border-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white"
                                                            }`}
                                                            title={selectedUser.retakeAllowed?.includes(stat.subjectId) ? "Ruxsat berilgan" : "Qayta topshirishga ruxsat berish"}
                                                        >
                                                            {selectedUser.retakeAllowed?.includes(stat.subjectId) ? <CheckCircle2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-gray-500">
                                            <p>No test data available for this user.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white transition-all hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { BookOpen } from "lucide-react";

