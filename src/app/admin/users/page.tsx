"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { Loader2, User, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const safeFormatDate = (dateVal: any) => {
        if (!dateVal) return "N/A";
        try {
            // Handle Firestore Timestamp vs regular Date/number
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
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <p className="text-gray-400">View and manage platform members</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/80 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined At</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.uid} className="hover:bg-gray-800/40 transition-all">
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
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}>
                                            {user.role === "admin" && <Shield className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {safeFormatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-500">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
