import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Routes that should redirect authenticated users
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for session cookie (Better-Auth uses this)
    const sessionCookie = request.cookies.get("better-auth.session_token");
    const isAuthenticated = !!sessionCookie;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect unauthenticated users to login for protected routes
    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/settings/:path*",
        "/login",
        "/register",
    ],
};
