"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogOut, LayoutDashboard, User, ShieldCheck, Menu, X, Globe, Megaphone, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Locale } from "@/locales/dictionary";

const LANG_LABELS: Record<Locale, string> = {
    en: "EN",
    uz: "UZ",
    ru: "RU",
};

const LANG_FULL: Record<Locale, string> = {
    en: "English",
    uz: "O'zbek",
    ru: "Русский",
};

export default function Navbar() {
    const { user, isAdmin } = useAuth();
    const { locale, setLocale, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleLocale = (l: Locale) => {
        setLocale(l);
        setIsLangOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="rounded-lg bg-blue-600 p-1.5">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">3-IDUM TTM</span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:text-blue-600 dark:hover:text-white"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    {t.nav.dashboard}
                                </Link>
                                <Link
                                    href="/dashboard/ads"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:text-blue-600 dark:hover:text-white"
                                >
                                    <Megaphone className="h-4 w-4" />
                                    {t.nav.ads}
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-white/10"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        {t.nav.admin}
                                    </Link>
                                )}
                                <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="max-w-[150px] truncate text-sm font-medium text-gray-300">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                                        title={t.nav.logout}
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                                >
                                    {t.nav.login}
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                                >
                                    {t.nav.register}
                                </Link>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white transition-all"
                            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>

                        {/* Language Switcher */}
                        <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white transition-colors"
                            >
                                <Globe className="h-4 w-4" />
                                {LANG_LABELS[locale]}
                            </button>
                            {isLangOpen && (
                                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden z-50">
                                    {(Object.keys(LANG_FULL) as Locale[]).map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => handleLocale(l)}
                                            className={`flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${locale === l ? "text-blue-600 font-semibold" : "text-gray-600 dark:text-gray-300"}`}
                                        >
                                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{LANG_LABELS[l]}</span>
                                            {LANG_FULL[l]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile: lang + burger */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Mobile language quick switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <Globe className="h-4 w-4" />
                                {LANG_LABELS[locale]}
                            </button>
                            {isLangOpen && (
                                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden z-50">
                                    {(Object.keys(LANG_FULL) as Locale[]).map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => handleLocale(l)}
                                            className={`flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${locale === l ? "text-blue-400 font-semibold" : "text-gray-300"}`}
                                        >
                                            <span className="text-xs font-mono bg-gray-800 px-1.5 py-0.5 rounded">{LANG_LABELS[l]}</span>
                                            {LANG_FULL[l]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 md:hidden shadow-xl">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block rounded-lg px-3 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.dashboard}
                                </Link>
                                <Link
                                    href="/dashboard/ads"
                                    className="block rounded-lg px-3 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.ads}
                                </Link>
                                {isAdmin && (
                                    <div className="space-y-1">
                                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            Admin Panel
                                        </div>
                                        <Link
                                            href="/admin"
                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 pl-6"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Overview
                                        </Link>
                                        <Link
                                            href="/admin/subjects"
                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 pl-6"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Subjects
                                        </Link>
                                        <Link
                                            href="/admin/tests"
                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 pl-6"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Tests
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 pl-6"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Users
                                        </Link>
                                        <Link
                                            href="/admin/stats"
                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 pl-6"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Statistics
                                        </Link>
                                    </div>
                                )}
                                <div className="border-t border-gray-800 mt-2 pt-2">
                                    <p className="px-3 py-2 text-sm text-gray-500 truncate">{user.email}</p>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-red-400 hover:bg-gray-800"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        {t.nav.logout}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 py-2">
                                <Link
                                    href="/login"
                                    className="block rounded-lg px-3 py-3 text-base font-medium text-gray-300 hover:bg-gray-800"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.login}
                                </Link>
                                <Link
                                    href="/register"
                                    className="block rounded-lg bg-blue-600 px-3 py-3 text-center text-base font-medium text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t.nav.register}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
