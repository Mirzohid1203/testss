"use client";

import { ShieldCheck, Book, Users, Shield, Terminal, Zap, CheckCircle2, ChevronRight, FileText, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const sections = [
    {
        id: "intro",
        title: "Kirish",
        icon: <Info className="h-5 w-5 text-blue-500" />,
        content: "3-IDUM TTM CRM — bu maktab ma'muriyati va o'quvchilar o'rtasidagi ta'lim jarayonlarini raqamlashtirish uchun ishlab chiqilgan yuqori samarali platforma. Tizim test topshirish, real vaqt rejimidagi analitika va foydalanuvchilar ierarxiyasini boshqarish imkonini beradi."
    },
    {
        id: "roles",
        title: "Foydalanuvchi Rollari",
        icon: <Users className="h-5 w-5 text-purple-500" />,
        content: "Tizim uch darajali kirish nazoratiga (RBAC) ega: \n\n• **Super Admin:** To'liq nazorat, adminlarni tasdiqlash va tizim sozlamalari. \n• **Admin (Nazoratchi):** Sinflar, fanlar va testlar boshqaruvi. \n• **User (O'quvchi):** Test topshirish va shaxsiy natijalarni kuzatish."
    },
    {
        id: "approval",
        title: "Admin Tasdiqlash Tizimi",
        icon: <Shield className="h-5 w-5 text-emerald-500" />,
        content: "Xavfsizlikni ta'minlash maqsadida yangi Adminlar ro'yxatdan o'tgandan so'ng 'pending_admin' statusiga ega bo'ladilar. Ular faqat Super Admin tomonidan tasdiqlangach, boshqaruv paneliga kirish huquqini qo'lga kiritadilar."
    },
    {
        id: "locking",
        title: "Fanlarni Qulflash (Subject Permissions)",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        content: "Adminlar har bir fan uchun ruxsat etilgan sinflarni (5-11) belgilashlari mumkin. Agar fanga ma'lum bir sinf uchun ruxsat berilmasa, o'sha sinf o'quvchilari ushbu fanni dashboardda ko'ra olmaydilar."
    },
    {
        id: "stats",
        title: "Analitika va Leaderboard",
        icon: <Terminal className="h-5 w-5 text-blue-400" />,
        content: "Tizim real vaqt rejimida statistikani hisoblaydi. Leaderboard faqat faol o'quvchilarni ko'rsatadi. O'chirilgan foydalanuvchilarning natijalari avtomatik ravishda statistikadan va bazadan tozalanadi."
    }
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-300 selection:bg-blue-500/30">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-600 p-1.5">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">Docs <span className="text-blue-500">Center</span></span>
                    </Link>
                    <Link href="/" className="text-sm font-medium hover:text-white transition-colors">Saytga qaytish</Link>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="hidden lg:block space-y-2 sticky top-28 h-fit">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-3">Hujjatlar Mundarijasi</p>
                        {sections.map(section => (
                            <a 
                                key={section.id} 
                                href={`#${section.id}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/5 hover:text-white transition-all group"
                            >
                                <div className="p-1 rounded-md group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                    {section.icon}
                                </div>
                                {section.title}
                            </a>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-16">
                        <header className="space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400"
                            >
                                <Zap className="h-3 w-3" /> System Documentation v1.2
                            </motion.div>
                            <h1 className="text-5xl font-black text-white tracking-tight">3-IDUM TTM CRM <br/><span className="text-blue-500">Texnik Qo'llanma</span></h1>
                            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                                Tizimdan samarali foydalanish va ma'muriy jarayonlarni boshqarish bo'yicha to'liq va professional qo'llanma.
                            </p>
                        </header>

                        <div className="space-y-20">
                            {sections.map((section, index) => (
                                <motion.section 
                                    key={section.id}
                                    id={section.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="scroll-mt-28 space-y-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
                                            {section.icon}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">{section.title}</h2>
                                    </div>
                                    <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8 backdrop-blur-sm">
                                        <div className="prose prose-invert max-w-none">
                                            {section.content.split('\n').map((line, i) => (
                                                <p key={i} className="text-gray-400 leading-relaxed mb-4 last:mb-0">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>
                            ))}
                        </div>

                        {/* Footer in Docs */}
                        <footer className="pt-20 border-t border-gray-800">
                            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -m-10 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-3xl font-bold">Yordam kerakmi?</h3>
                                    <p className="text-blue-100 max-w-lg">
                                        Agar tizimdan foydalanishda qo'shimcha savollaringiz bo'lsa yoki texnik nosozliklarga duch kelsangiz, biz bilan bog'laning.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <a href="mailto:mmahmutaliyev411@gmail.com" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                                            Email orqali bog'lanish
                                            <ChevronRight className="h-4 w-4" />
                                        </a>
                                        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all">
                                            Bosh sahifa
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-12 text-center text-sm text-gray-600">
                                &copy; {new Date().getFullYear()} 3-IDUM TTM Systems. Barcha huquqlar himoyalangan.
                            </p>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}
