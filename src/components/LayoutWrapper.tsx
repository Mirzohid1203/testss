"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide Navbar and Footer during the actual test
    const isTestPage = pathname.startsWith("/test/");

    return (
        <>
            {!isTestPage && <Navbar />}
            <main className="flex-1">
                {children}
            </main>
            {!isTestPage && <Footer />}
        </>
    );
}
