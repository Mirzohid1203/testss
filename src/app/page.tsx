"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, BookOpen, ShieldCheck, BarChart3, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 space-y-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
          <GraduationCap className="h-4 w-4" />
          <span>{t.hero.badge}</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
          {t.hero.title}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            Smart Tests
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {user ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] sm:w-auto"
            >
              {t.hero.goDashboard}
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] sm:w-auto"
              >
                {t.hero.getStarted}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-gray-800 sm:w-auto shadow-sm"
              >
                {t.hero.signIn}
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-10 mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3"
      >
        {[
          { icon: <BookOpen className="h-8 w-8 text-blue-400" />, ...t.features.subjects },
          { icon: <ShieldCheck className="h-8 w-8 text-purple-400" />, ...t.features.secure },
          { icon: <BarChart3 className="h-8 w-8 text-emerald-400" />, ...t.features.stats },
        ].map((feature, i) => (
          <div key={i} className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 p-6 text-left transition-all hover:border-blue-400 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900/60 shadow-sm hover:shadow-xl">
            <div className="mb-4 rounded-xl bg-blue-50 dark:bg-gray-800/50 p-3 w-fit group-hover:bg-blue-100 dark:group-hover:bg-gray-800">{feature.icon}</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
