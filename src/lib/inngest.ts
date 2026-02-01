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
        };
    };
    "meeting/summarize": {
        data: {
            meetingId: string;
            transcript: string;
        };
    };
};
