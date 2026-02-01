import { inngest, type MeetingEvents } from "@/lib/inngest";
import { db } from "@/db";
import { meeting } from "@/schema";
import { eq } from "drizzle-orm";
import { generateMeetingSummary } from "@/lib/openai";

/**
 * Background function: Summarize meeting transcript
 * Triggered after transcription is ready
 */
export const summarizeMeeting = inngest.createFunction(
    {
        id: "summarize-meeting",
        name: "Summarize Meeting",
        retries: 3,
    },
    { event: "meeting/summarize" },
    async ({ event, step }) => {
        const { meetingId, transcript } = event.data;

        // Step 1: Generate AI summary
        const summary = await step.run("generate-summary", async () => {
            console.log(`[Inngest] Generating summary for meeting ${meetingId}`);
            return await generateMeetingSummary(transcript);
        });

        // Step 2: Update meeting in database
        await step.run("update-meeting", async () => {
            console.log(`[Inngest] Updating meeting ${meetingId} with summary`);

            // In production, store summary in a separate field/table
            await db
                .update(meeting)
                .set({
                    status: "completed",
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId));

            return { success: true };
        });

        console.log(`[Inngest] Meeting ${meetingId} summarization complete`);
        return { meetingId, summary };
    }
);

/**
 * Background function: Process transcription
 * Triggered when Stream sends transcription_ready webhook
 */
export const processTranscription = inngest.createFunction(
    {
        id: "process-transcription",
        name: "Process Transcription",
        retries: 3,
    },
    { event: "meeting/transcription.ready" },
    async ({ event, step }) => {
        const { meetingId, transcript, transcriptUrl } = event.data;

        // Step 1: Fetch transcript if URL provided
        const finalTranscript = await step.run("fetch-transcript", async () => {
            if (transcript) return transcript;

            if (transcriptUrl) {
                // In production, fetch from URL
                console.log(`[Inngest] Fetching transcript from ${transcriptUrl}`);
                return "Placeholder transcript fetched from URL";
            }

            return "No transcript available";
        });

        // Step 2: Trigger summarization
        await step.sendEvent("trigger-summarize", {
            name: "meeting/summarize",
            data: {
                meetingId,
                transcript: finalTranscript,
            },
        });

        return { meetingId, transcriptLength: finalTranscript.length };
    }
);

/**
 * Background function: Process recording
 * Triggered when Stream sends recording_ready webhook
 */
export const processRecording = inngest.createFunction(
    {
        id: "process-recording",
        name: "Process Recording",
        retries: 3,
    },
    { event: "meeting/recording.ready" },
    async ({ event, step }) => {
        const { meetingId, recordingUrl } = event.data;

        // In production, store recording URL in database
        await step.run("save-recording", async () => {
            console.log(`[Inngest] Recording ready for meeting ${meetingId}`);
            console.log(`[Inngest] Recording URL: ${recordingUrl}`);

            // Could add a recordingUrl field to meeting table
            // For now, just log it
            return { success: true };
        });

        return { meetingId, recordingUrl };
    }
);

/**
 * Background function: Handle call ended
 * Sets meeting to processing and waits for transcription
 */
export const handleCallEnded = inngest.createFunction(
    {
        id: "handle-call-ended",
        name: "Handle Call Ended",
        retries: 3,
    },
    { event: "meeting/call.ended" },
    async ({ event, step }) => {
        const { meetingId, callId } = event.data;

        // Step 1: Set meeting to processing
        await step.run("set-processing", async () => {
            console.log(`[Inngest] Setting meeting ${meetingId} to processing`);

            await db
                .update(meeting)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId));

            return { success: true };
        });

        // Step 2: Wait for transcription (simulated delay in dev)
        // In production, this would be triggered by transcription.ready event
        await step.sleep("wait-for-processing", "5s");

        // Step 3: Simulate transcription ready (dev only)
        if (process.env.NODE_ENV !== "production") {
            await step.sendEvent("dev-transcription-ready", {
                name: "meeting/transcription.ready",
                data: {
                    callId,
                    meetingId,
                    transcript: "This is a simulated meeting transcript for development. The actual transcript would come from Stream's transcription service in production.",
                },
            });
        }

        return { meetingId, status: "processing-started" };
    }
);

// Export all functions for the API route
export const functions = [
    summarizeMeeting,
    processTranscription,
    processRecording,
    handleCallEnded,
];
