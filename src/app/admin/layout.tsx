"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Users,
    BarChart,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { name: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/admin" },
        { name: "Subjects", icon: <BookOpen className="h-5 w-5" />, href: "/admin/subjects" },
        { name: "Tests", icon: <FileQuestion className="h-5 w-5" />, href: "/admin/tests" },
        { name: "Users", icon: <Users className="h-5 w-5" />, href: "/admin/users" },
        { name: "Statistics", icon: <BarChart className="h-5 w-5" />, href: "/admin/stats" },
    ];

    return (
        <ProtectedRoute adminOnly>
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-900/50 md:flex">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-8">
                        <nav className="flex-1 space-y-1 px-4">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            }`}
                                    >
                                        <span className="mr-3 transition-transform group-hover:scale-110">
                                            {item.icon}
                                        </span>
                                        {item.name}
                                        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>

    );
}
