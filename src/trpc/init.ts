import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { polarClient } from "@/lib/polar";

/**
 * tRPC Context - Available in all procedures
 */
export const createTRPCContext = async () => {
    let session = null;

    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch (error) {
        // Session retrieval failed - user is not authenticated
        // This is expected for unauthenticated requests
        console.log("Session not found or expired");
    }

    return {
        session,
        user: session?.user ?? null,
    };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

/**
 * Reusable exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        });
    }

    return next({
        ctx: {
            session: ctx.session,
            user: ctx.user,
        },
    });
});

/**
 * Premium procedure - requires active subscription
 * Extends protectedProcedure with Polar subscription check
 */
export const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    try {
        // Look up customer by user's email in Polar
        const customers = await polarClient.customers.list({
            query: ctx.user.email,
            limit: 1,
        });

        const customer = customers.result.items[0];

        if (!customer) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Upgrade to Pro to access this feature",
            });
        }

        // Check for active subscriptions
        const subscriptions = await polarClient.subscriptions.list({
            customerId: customer.id,
            active: true,
            limit: 1,
        });

        const hasActiveSubscription = subscriptions.result.items.length > 0;

        if (!hasActiveSubscription) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Your subscription is inactive. Upgrade to Pro to continue.",
            });
        }

        return next({
            ctx: {
                ...ctx,
                subscription: subscriptions.result.items[0],
            },
        });
    } catch (error) {
        if (error instanceof TRPCError) throw error;
        // If Polar is not configured or unavailable, log but allow access
        console.error("[Premium Check] Error:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to verify subscription status",
        });
    }
});

