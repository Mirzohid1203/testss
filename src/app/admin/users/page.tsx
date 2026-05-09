"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, TestResult } from "@/types";
import { Loader2, User, Mail, Calendar, Shield, Crown, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface UserWithStats extends UserProfile {
    testsTaken: number;
    totalScore: number;
    rank?: number;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const { isSuperAdmin } = useAuth();

    useEffect(() => {
        const fetchUsersAndStats = async () => {
            try {
                // Fetch all results first for stats
                const resultsSnap = await getDocs(collection(db, "results"));
                const results = resultsSnap.docs.map(doc => doc.data() as TestResult);

                // Listen to users
                const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    let usersData = snapshot.docs.map(doc => {
                        const userData = doc.data() as UserProfile;
                        const userResults = results.filter(r => r.userId === userData.uid);
                        const testsTaken = userResults.length;
                        const totalScore = userResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
                        
                        return {
                            ...userData,
                            testsTaken,
                            totalScore
                        };
                    });

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

    const handleRoleChange = async (uid: string, newRole: string) => {
        if (!isSuperAdmin) return;
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
            toast.success("Role updated successfully");
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Users & Leaderboard</h1>
                <p className="text-gray-400">View and manage platform members</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-x-auto shadow-xl">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-800/80 text-xs font-semibold uppercase text-gray-500 whitespace-nowrap">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Tests Taken</th>
                            <th className="px-6 py-4">Total Score</th>
                            <th className="px-6 py-4">Joined At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.uid} className="hover:bg-gray-800/40 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 font-bold text-gray-300">
                                            #{user.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.email}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.uid}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSuperAdmin && user.role !== "superadmin" ? (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                user.role === "superadmin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                user.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}>
                                                {user.role === "superadmin" && <Crown className="h-3 w-3" />}
                                                {user.role === "admin" && <Shield className="h-3 w-3" />}
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-white">{user.testsTaken}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-white">{user.totalScore}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {safeFormatDate(user.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

