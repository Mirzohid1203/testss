"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-8 sm:py-12 transition-colors duration-300">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="rounded-lg bg-blue-600 p-1.5">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">3-IDUM TTM</span>
                        </Link>
                        <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {t.footer.desc}
                        </p>
                        <div className="flex gap-4 pt-1">
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="LinkedIn">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-300">{t.footer.platform}</h3>
                            <ul className="mt-4 space-y-2.5">
                                <li><Link href="/dashboard" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.nav.dashboard}</Link></li>
                                <li><Link href="/register" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.hero.getStarted}</Link></li>
                                <li><Link href="/login" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.nav.login}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-300">{t.footer.support}</h3>
                            <ul className="mt-4 space-y-2.5">
                                <li><Link href="/docs" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.footer.docs}</Link></li>
                                <li><Link href="#" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.footer.help}</Link></li>
                                <li><Link href="#" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.footer.contact}</Link></li>
                                <li><Link href="#" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} 3-IDUM TTM. {t.footer.rights}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4 shrink-0" />
                        <a href="mailto:mmahmutaliyev411@gmail.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            mmahmutaliyev411@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
