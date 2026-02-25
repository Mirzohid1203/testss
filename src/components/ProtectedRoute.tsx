"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { user, profile, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(`/login?callbackUrl=${pathname}`);
            } else if (adminOnly && !isAdmin) {
                router.push("/dashboard");
            }
        }
    }, [user, profile, loading, isAdmin, router, pathname, adminOnly]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user || (adminOnly && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
}
