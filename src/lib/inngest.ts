import { Inngest } from "inngest";

// Initialize Inngest client
export const inngest = new Inngest({
    id: "meet-ai",
    name: "Meet AI",
});

// Event types for type-safety
export type MeetingEvents = {
    "meeting/call.ended": {
        data: {
            callId: string;
            meetingId: string;
            duration?: number; // Call duration in seconds
            participantsCount?: number; // Number of participants
        };
    };
    "meeting/transcription.ready": {
        data: {
            callId: string;
            meetingId: string;
            transcriptUrl?: string;
            transcript?: string;
        };
    };
    "meeting/recording.ready": {
        data: {
            callId: string;
            meetingId: string;
            recordingUrl: string;
            format?: string; // e.g., "mp4", "webm"
            size?: number; // File size in bytes
            duration?: number; // Recording duration in seconds
        };
    };
    "meeting/summarize": {
        data: {
            meetingId: string;
            transcript: string;
        };
    };
};
