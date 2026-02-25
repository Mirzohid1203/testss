import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Note: Standard Firebase Client Auth doesn't provide tokens to Middleware 
    // without a custom cookie session implementation.
    // We use client-side ProtectedRoute for the core logic.

    // Example structural check for protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        // In a full production app, you would check for a session cookie here.
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/test/:path*', '/result/:path*'],
};
