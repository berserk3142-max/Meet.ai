import { db } from "@/db";
import { meeting } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * Meeting Events Service
 * Handles event-driven meeting state transitions
 */
export const meetingEventsService = {
    /**
     * Called when a video call starts
     * Transition: upcoming → active
     */
    async onCallStarted(callId: string) {
        console.log(`[Meeting Event] Call started: ${callId}`);

        const [updated] = await db
            .update(meeting)
            .set({
                status: "active",
                startedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(meeting.callId, callId))
            .returning();

        if (updated) {
            console.log(`[Meeting Event] Meeting ${updated.id} → active`);
        }

        return updated;
    },

    /**
     * Called when a video call ends
     * Transition: active → processing → completed
     */
    async onCallEnded(callId: string) {
        console.log(`[Meeting Event] Call ended: ${callId}`);

        // First, set to processing
        const [updated] = await db
            .update(meeting)
            .set({
                status: "processing",
                endedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(meeting.callId, callId))
            .returning();

        if (updated) {
            console.log(`[Meeting Event] Meeting ${updated.id} → processing`);

            // Trigger async AI processing (in production, use job queue)
            // For now, simulate with setTimeout
            setTimeout(async () => {
                await this.onProcessingComplete(updated.id, {
                    summary: "Meeting summary will be generated here.",
                    keyPoints: ["Point 1", "Point 2"],
                    actionItems: ["Action 1", "Action 2"],
                });
            }, 3000);
        }

        return updated;
    },

    /**
     * Called when AI processing is complete
     * Transition: processing → completed
     */
    async onProcessingComplete(
        meetingId: string,
        result: {
            summary: string;
            keyPoints: string[];
            actionItems: string[];
        }
    ) {
        console.log(`[Meeting Event] Processing complete: ${meetingId}`);

        // In production, store the summary in a separate table or JSON field
        // For now, just update status
        const [updated] = await db
            .update(meeting)
            .set({
                status: "completed",
                updatedAt: new Date(),
            })
            .where(eq(meeting.id, meetingId))
            .returning();

        if (updated) {
            console.log(`[Meeting Event] Meeting ${updated.id} → completed`);
            console.log(`[Meeting Event] Summary:`, result.summary);
        }

        return updated;
    },

    /**
     * Called when a call is cancelled
     * Transition: any → cancelled
     */
    async onCallCancelled(callId: string) {
        console.log(`[Meeting Event] Call cancelled: ${callId}`);

        const [updated] = await db
            .update(meeting)
            .set({
                status: "cancelled",
                updatedAt: new Date(),
            })
            .where(eq(meeting.callId, callId))
            .returning();

        if (updated) {
            console.log(`[Meeting Event] Meeting ${updated.id} → cancelled`);
        }

        return updated;
    },
};
