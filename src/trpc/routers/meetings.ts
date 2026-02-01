import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { meetingsService, createMeetingSchema, updateMeetingSchema, meetingsFilterSchema } from "@/modules/meetings";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = router({
    /**
     * Get all meetings for the current user
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const meetings = await meetingsService.getAllByUserId(ctx.user.id);
        return meetings;
    }),

    /**
     * Get meetings with pagination and filters
     */
    getMany: protectedProcedure
        .input(meetingsFilterSchema)
        .query(async ({ ctx, input }) => {
            const result = await meetingsService.getMany({
                userId: ctx.user.id,
                ...input,
            });
            return result;
        }),

    /**
     * Get meetings by agent ID
     */
    getByAgentId: protectedProcedure
        .input(z.object({ agentId: z.string() }))
        .query(async ({ ctx, input }) => {
            const meetings = await meetingsService.getByAgentId(input.agentId, ctx.user.id);
            return meetings;
        }),

    /**
     * Get a single meeting by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const meeting = await meetingsService.getById(input.id, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            return meeting;
        }),

    /**
     * Create a new meeting
     */
    create: protectedProcedure
        .input(createMeetingSchema)
        .mutation(async ({ ctx, input }) => {
            const meeting = await meetingsService.create(input, ctx.user.id);
            return meeting;
        }),

    /**
     * Update a meeting
     */
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: updateMeetingSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await meetingsService.update(input.id, input.data, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found or you don't have permission",
                });
            }

            return meeting;
        }),

    /**
     * Delete a meeting
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await meetingsService.delete(input.id, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found or you don't have permission",
                });
            }

            return { success: true, deletedMeeting: meeting };
        }),

    /**
     * Get meeting count for an agent
     */
    getCountByAgentId: protectedProcedure
        .input(z.object({ agentId: z.string() }))
        .query(async ({ ctx, input }) => {
            const count = await meetingsService.getCountByAgentId(input.agentId, ctx.user.id);
            return { count };
        }),
});
