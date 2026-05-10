import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3-IDUM TTM | Professional Online Testing & Analytics",
  description: "Advanced online testing platform with real-time analytics, secure test environment, and powerful admin management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-gray-950 text-gray-50 flex min-h-screen flex-col`}
      >
        <LanguageProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
              }}
            />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
