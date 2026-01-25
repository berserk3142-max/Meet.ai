import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * tRPC Context - Available in all procedures
 */
export const createTRPCContext = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

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
