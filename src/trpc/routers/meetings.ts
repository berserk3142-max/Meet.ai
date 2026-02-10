import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { meetingsService, createMeetingSchema, updateMeetingSchema, meetingsFilterSchema } from "@/modules/meetings";
import { TRPCError } from "@trpc/server";
import { chatWithTranscript } from "@/lib/openai";

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

    /**
     * Get meeting transcript
     */
    getTranscript: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const meeting = await meetingsService.getById(input.id, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            // Parse transcript JSON if available
            const transcriptData = meeting.transcript
                ? JSON.parse(meeting.transcript)
                : null;

            return {
                transcript: transcriptData,
                hasTranscript: !!meeting.transcript,
            };
        }),

    /**
     * Get meeting summary
     */
    getSummary: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const meeting = await meetingsService.getById(input.id, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            // Parse summary JSON if available
            const summaryData = meeting.summary
                ? JSON.parse(meeting.summary)
                : null;

            return {
                summary: summaryData,
                hasSummary: !!meeting.summary,
            };
        }),

    /**
     * Get chat history for a meeting
     */
    getChatHistory: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const messages = await meetingsService.getChatHistory(input.meetingId, ctx.user.id);

            if (messages === null) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            return { messages };
        }),

    /**
     * Send a chat message and get AI response
     */
    sendChatMessage: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
            message: z.string().min(1).max(2000),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Verify meeting access and get meeting data
            const meeting = await meetingsService.getById(input.meetingId, ctx.user.id);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            if (meeting.status !== "completed") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Chat is only available for completed meetings",
                });
            }

            // 2. Save user message
            await meetingsService.saveChatMessage(
                input.meetingId,
                ctx.user.id,
                "user",
                input.message
            );

            // 3. Get chat history for context
            const chatHistory = await meetingsService.getChatHistory(input.meetingId, ctx.user.id);
            const historyForAI = (chatHistory || []).map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            }));

            // 4. Get transcript and summary for AI context
            const transcript = meeting.transcript || "";
            const summary = meeting.summary || null;

            // 5. Call AI with meeting context
            const aiResponse = await chatWithTranscript({
                transcript,
                summary,
                userMessage: input.message,
                chatHistory: historyForAI,
            });

            // 6. Save assistant response
            await meetingsService.saveChatMessage(
                input.meetingId,
                ctx.user.id,
                "assistant",
                aiResponse
            );

            return {
                response: aiResponse,
            };
        }),
});

