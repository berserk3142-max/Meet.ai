import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes - these require authentication
const isProtectedRoute = createRouteMatcher([
    "/",
    "/meetings(.*)",
    "/agents(.*)",
    "/schedule(.*)",
    "/profile(.*)",
    "/settings(.*)",
    "/upgrade(.*)",
]);

// Routes that should be completely ignored by Clerk middleware
// These are called by external services (webhooks, inngest, etc.)
const isIgnoredRoute = createRouteMatcher([
    "/api/webhooks(.*)",
    "/api/inngest(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // Skip Clerk processing entirely for external service routes
    if (isIgnoredRoute(req)) {
        return;
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
