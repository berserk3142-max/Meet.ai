import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { generateStreamToken, generateAvatar, addAgentToCall } from "@/lib/stream";
import { meetingsService } from "@/modules/meetings";
import { createRealtimeSession } from "@/lib/openai-realtime";

export const streamRouter = router({
    /**
     * Generate a Stream Video token for the current user
     * This is called by the client before joining a call
     */
    generateToken: protectedProcedure.query(async ({ ctx }) => {
        const token = generateStreamToken(ctx.user.id);
        const avatar = generateAvatar(ctx.user.name || ctx.user.email || "User");

        return {
            token,
            userId: ctx.user.id,
            userName: ctx.user.name || ctx.user.email || "User",
            userImage: ctx.user.image || avatar,
        };
    }),

    /**
     * Add AI agent to a call
     * Called when user joins a meeting to bring the AI agent in
     */
    addAgentToCall: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
            callId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Get the meeting to find the associated agent
            const meeting = await meetingsService.getById(input.meetingId, ctx.user.id);

            if (!meeting || !meeting.agent) {
                throw new Error("Meeting or agent not found");
            }

            // Add the AI agent to the call
            const result = await addAgentToCall(
                input.callId,
                meeting.agent.id,
                meeting.agent.name
            );

            return {
                success: true,
                agentId: meeting.agent.id,
                agentName: meeting.agent.name,
                agentUserId: result.agentUserId,
            };
        }),

    /**
     * Create a Realtime API session for voice AI
     * Returns ephemeral token for client WebRTC connection
     */
    createRealtimeSession: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Get the meeting and agent
            const meeting = await meetingsService.getById(input.meetingId, ctx.user.id);

            if (!meeting || !meeting.agent) {
                throw new Error("Meeting or agent not found");
            }

            try {
                // Create Realtime session
                const session = await createRealtimeSession(
                    meeting.agent.name,
                    meeting.agent.description || undefined
                );

                return session;
            } catch (error: any) {
                console.error("[Stream Router] Realtime session error:", error.message);
                throw new Error("REALTIME_NOT_AVAILABLE");
            }
        }),
});
