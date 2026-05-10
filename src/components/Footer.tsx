"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-gray-800 bg-gray-950 px-4 py-12">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="rounded-lg bg-blue-600 p-1.5">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">3-IDUM TTM</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-gray-400">
                            {t.footer.desc}
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">{t.footer.platform}</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">{t.nav.dashboard}</Link></li>
                            <li><Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">{t.hero.getStarted}</Link></li>
                            <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">{t.nav.login}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">{t.footer.support}</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-800 pt-8 text-center md:flex md:items-center md:justify-between">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} 3-IDUM TTM. {t.footer.rights}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 md:mt-0">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:mmhamutaliyev411@gmail.com" className="hover:text-blue-400 transition-colors">
                            mmahmutaliyev411@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
