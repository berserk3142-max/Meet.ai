import { inngest, type MeetingEvents } from "@/lib/inngest";
import { db } from "@/db";
import { meeting } from "@/schema";
import { eq } from "drizzle-orm";
import {
    generateMeetingSummary,
    fetchTranscriptFromUrl,
    cleanTranscript
} from "@/lib/openai";

/**
 * Background function: Handle call ended
 * Sets meeting to processing and stores call metadata
 */
export const handleCallEnded = inngest.createFunction(
    {
        id: "handle-call-ended",
        name: "Handle Call Ended",
        retries: 3,
    },
    { event: "meeting/call.ended" },
    async ({ event, step }) => {
        const { meetingId, callId, duration, participantsCount } = event.data;

        // Step 1: Set meeting to processing and store metadata
        const updatedMeeting = await step.run("set-processing", async () => {
            console.log(`[Inngest] Call ended for meeting ${meetingId}`);
            console.log(`[Inngest] Duration: ${duration}s, Participants: ${participantsCount}`);

            const [updated] = await db
                .update(meeting)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId))
                .returning();

            return updated;
        });

        if (!updatedMeeting) {
            console.error(`[Inngest] Meeting ${meetingId} not found`);
            return { error: "Meeting not found" };
        }

        console.log(`[Inngest] Meeting ${meetingId} → processing`);
        return {
            meetingId,
            status: "processing-started",
            duration,
            participantsCount
        };
    }
);

/**
 * Background function: Process transcription
 * Fetches transcript, cleans it, stores it, and triggers summarization
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

        // Step 1: Fetch or use provided transcript
        const rawTranscript = await step.run("fetch-transcript", async () => {
            if (transcript) {
                console.log(`[Inngest] Using provided transcript for meeting ${meetingId}`);
                return transcript;
            }

            if (transcriptUrl) {
                console.log(`[Inngest] Fetching transcript from URL for meeting ${meetingId}`);
                try {
                    return await fetchTranscriptFromUrl(transcriptUrl);
                } catch (error) {
                    console.error(`[Inngest] Failed to fetch transcript:`, error);
                    return "Failed to fetch transcript from URL";
                }
            }

            return "No transcript available";
        });

        // Step 2: Clean the transcript
        const cleanedTranscript = await step.run("clean-transcript", async () => {
            console.log(`[Inngest] Cleaning transcript for meeting ${meetingId}`);
            return cleanTranscript(rawTranscript);
        });

        // Step 3: Store transcript in database
        await step.run("store-transcript", async () => {
            console.log(`[Inngest] Storing transcript for meeting ${meetingId}`);

            // Store as JSON with metadata
            const transcriptData = JSON.stringify({
                raw: rawTranscript,
                cleaned: cleanedTranscript,
                processedAt: new Date().toISOString(),
                charCount: cleanedTranscript.length,
            });

            await db
                .update(meeting)
                .set({
                    transcript: transcriptData,
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId));

            return { success: true };
        });

        // Step 4: Trigger summarization
        await step.sendEvent("trigger-summarize", {
            name: "meeting/summarize",
            data: {
                meetingId,
                transcript: cleanedTranscript,
            },
        });

        console.log(`[Inngest] Transcript processing complete for meeting ${meetingId}`);
        return {
            meetingId,
            transcriptLength: cleanedTranscript.length,
            summarizationTriggered: true
        };
    }
);

/**
 * Background function: Process recording
 * Stores recording URL and metadata in database
 */
export const processRecording = inngest.createFunction(
    {
        id: "process-recording",
        name: "Process Recording",
        retries: 3,
    },
    { event: "meeting/recording.ready" },
    async ({ event, step }) => {
        const { meetingId, recordingUrl, format, size, duration } = event.data;

        // Store recording metadata in database
        await step.run("save-recording", async () => {
            console.log(`[Inngest] Recording ready for meeting ${meetingId}`);
            console.log(`[Inngest] Recording URL: ${recordingUrl}`);
            console.log(`[Inngest] Format: ${format}, Size: ${size}, Duration: ${duration}`);

            await db
                .update(meeting)
                .set({
                    recordingUrl: recordingUrl,
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId));

            return { success: true };
        });

        console.log(`[Inngest] Recording saved for meeting ${meetingId}`);
        return {
            meetingId,
            recordingUrl,
            metadata: { format, size, duration }
        };
    }
);

/**
 * Background function: Summarize meeting transcript
 * Generates AI summary with sentiment analysis and meeting notes
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

        // Step 1: Generate AI summary with enhanced analysis
        const summaryResult = await step.run("generate-summary", async () => {
            console.log(`[Inngest] Generating enhanced summary for meeting ${meetingId}`);
            console.log(`[Inngest] Transcript length: ${transcript.length} chars`);

            return await generateMeetingSummary(transcript);
        });

        // Step 2: Store summary and update meeting status
        await step.run("store-summary", async () => {
            console.log(`[Inngest] Storing summary for meeting ${meetingId}`);

            const summaryData = JSON.stringify({
                ...summaryResult,
                generatedAt: new Date().toISOString(),
            });

            await db
                .update(meeting)
                .set({
                    summary: summaryData,
                    status: "completed",
                    updatedAt: new Date(),
                })
                .where(eq(meeting.id, meetingId));

            return { success: true };
        });

        console.log(`[Inngest] Meeting ${meetingId} summarization complete → completed`);
        return {
            meetingId,
            summary: summaryResult.summary,
            keyPointsCount: summaryResult.keyPoints.length,
            actionItemsCount: summaryResult.actionItems.length,
            sentiment: summaryResult.sentiment.overall,
        };
    }
);

// Export all functions for the API route
export const functions = [
    handleCallEnded,
    processTranscription,
    processRecording,
    summarizeMeeting,
];
