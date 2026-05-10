"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Users,
    BarChart,
    ChevronRight,
    Megaphone,
    Crown,
    X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isSuperAdmin } = useAuth();
    const { t } = useLanguage();

    const menuItems = [
        { name: t.adminNav.overview, icon: <LayoutDashboard className="h-5 w-5" />, href: "/admin" },
        { name: t.adminNav.subjects, icon: <BookOpen className="h-5 w-5" />, href: "/admin/subjects" },
        { name: t.adminNav.tests, icon: <FileQuestion className="h-5 w-5" />, href: "/admin/tests" },
        { name: t.adminNav.users, icon: <Users className="h-5 w-5" />, href: "/admin/users" },
        { name: t.adminNav.statistics, icon: <BarChart className="h-5 w-5" />, href: "/admin/stats" },
    ];

    if (isSuperAdmin) {
        menuItems.push({ name: t.adminNav.announcements, icon: <Megaphone className="h-5 w-5" />, href: "/admin/ads" });
    }


    const SidebarContent = () => (
        <nav className="flex-1 space-y-2 px-4 pt-8">
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
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
    );

    return (
        <ProtectedRoute adminOnly>
            <div className="flex min-h-screen w-full bg-gray-950">

                {/* Desktop Sidebar */}
                <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-900/50 md:flex h-screen sticky top-0">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar Drawer */}
                <aside className={`fixed inset-y-0 left-0 z-[60] w-72 transform bg-gray-950 transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
                        <span className="text-xl font-bold text-white">{t.adminNav.menu}</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <SidebarContent />
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
                    {isSuperAdmin && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
                            <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
                                <Crown className="h-3.5 w-3.5" />
                                {t.adminNav.superAdminMode}
                            </div>
                        </div>
                    )}
                    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Navigation (Admin Panel) */}
                <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-gray-800 bg-gray-950/95 backdrop-blur-md px-2 py-3 md:hidden pb-safe">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all ${
                                    isActive ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                <span className={`${isActive ? "scale-110" : ""}`}>{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </ProtectedRoute>
    );
}
