import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Force Node.js runtime to avoid Edge runtime compatibility issues on Vercel
export const runtime = "nodejs";

// Define public routes - these do NOT require authentication
const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/inngest(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and external API routes
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Run for tRPC routes only (webhooks and inngest are handled as public routes above)
        "/(trpc)(.*)",
    ],
};

