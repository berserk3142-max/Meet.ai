import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, currentUser } from "@clerk/nextjs/server";
import { polarClient } from "@/lib/polar";
import { db } from "@/db";
import { user as userTable, account as accountTable, session as sessionTable, agent as agentTable, meeting as meetingTable, chatMessage as chatMessageTable } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * Sync Clerk user to local database (upsert)
 * Handles email uniqueness conflicts from old better-auth users
 */
async function syncUserToDb(clerkUser: { id: string; name: string; email: string; image?: string | null }) {
    const now = new Date();
    try {
        // Check if user already exists by Clerk ID
        const existingById = await db.select().from(userTable).where(eq(userTable.id, clerkUser.id)).limit(1);

        if (existingById.length > 0) {
            // User exists, update profile
            await db.update(userTable).set({
                name: clerkUser.name,
                email: clerkUser.email,
                image: clerkUser.image || null,
                updatedAt: now,
            }).where(eq(userTable.id, clerkUser.id));
            return;
        }

        // Check if there's an old user with the same email (from better-auth)
        const existingByEmail = await db.select().from(userTable).where(eq(userTable.email, clerkUser.email)).limit(1);

        if (existingByEmail.length > 0) {
            const oldId = existingByEmail[0].id;
            console.log(`[Auth] Migrating old user ${oldId} → ${clerkUser.id}`);

            // Step 1: Insert the NEW user row first (Clerk ID)
            await db.insert(userTable).values({
                id: clerkUser.id,
                name: clerkUser.name,
                email: `${clerkUser.id}@temp.migrate`,  // temp email to avoid unique conflict
                emailVerified: true,
                image: clerkUser.image || null,
                createdAt: existingByEmail[0].createdAt || now,
                updatedAt: now,
            });

            // Step 2: Re-point all FK references from old ID → new ID
            await db.update(agentTable).set({ userId: clerkUser.id }).where(eq(agentTable.userId, oldId));
            await db.update(meetingTable).set({ userId: clerkUser.id }).where(eq(meetingTable.userId, oldId));
            await db.update(chatMessageTable).set({ userId: clerkUser.id }).where(eq(chatMessageTable.userId, oldId));

            // Step 3: Delete old better-auth tables + old user row
            await db.delete(accountTable).where(eq(accountTable.userId, oldId));
            await db.delete(sessionTable).where(eq(sessionTable.userId, oldId));
            await db.delete(userTable).where(eq(userTable.id, oldId));

            // Step 4: Fix the email on the new user row
            await db.update(userTable).set({ email: clerkUser.email }).where(eq(userTable.id, clerkUser.id));

            console.log(`[Auth] Migration complete: ${clerkUser.id}`);
            return;
        }

        // New user — insert
        await db.insert(userTable).values({
            id: clerkUser.id,
            name: clerkUser.name,
            email: clerkUser.email,
            emailVerified: true,
            image: clerkUser.image || null,
            createdAt: now,
            updatedAt: now,
        });
        console.log(`[Auth] Synced new Clerk user to DB: ${clerkUser.id}`);
    } catch (error) {
        console.error(`[Auth] Failed to sync user ${clerkUser.id}:`, error);
    }
}

/**
 * tRPC Context - Available in all procedures
 */
export const createTRPCContext = async () => {
    const { userId } = await auth();
    let user = null;

    if (userId) {
        const clerkUser = await currentUser();
        if (clerkUser) {
            user = {
                id: clerkUser.id,
                name: clerkUser.firstName
                    ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
                    : clerkUser.username || "User",
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
                image: clerkUser.imageUrl,
            };
        }
    }

    return {
        userId,
        user,
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
 * Also syncs the Clerk user to the local DB to satisfy foreign key constraints
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        });
    }

    // Sync Clerk user to local database
    await syncUserToDb(ctx.user);

    return next({
        ctx: {
            userId: ctx.userId,
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
