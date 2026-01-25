import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../init";

export const usersRouter = router({
    // Get current user (protected - requires auth)
    getMe: protectedProcedure.query(async ({ ctx }) => {
        return {
            id: ctx.user.id,
            name: ctx.user.name,
            email: ctx.user.email,
            image: ctx.user.image,
        };
    }),

    // Get user by ID (example with input validation)
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            // In real app, fetch from database
            return {
                id: input.id,
                name: "Sample User",
                email: "sample@example.com",
            };
        }),

    // Update profile (protected mutation)
    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                email: z.string().email().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // In real app, update database
            return {
                success: true,
                user: {
                    id: ctx.user.id,
                    name: input.name || ctx.user.name,
                    email: input.email || ctx.user.email,
                },
            };
        }),
});
