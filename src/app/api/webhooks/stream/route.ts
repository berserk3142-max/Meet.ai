import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { meeting } from "@/schema";
import { eq } from "drizzle-orm";

const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

/**
 * Verify Stream webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
    if (!STREAM_API_SECRET) {
        console.warn("[Webhook] No STREAM_API_SECRET configured");
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", STREAM_API_SECRET)
        .update(body)
        .digest("hex");

    // Handle both full and prefix-only signature comparisons
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        // If lengths don't match, signatures are definitely different
        return false;
    }
}

/**
 * Get meeting by callId
 */
async function getMeetingByCallId(callId: string) {
    const [result] = await db
        .select()
        .from(meeting)
        .where(eq(meeting.callId, callId))
        .limit(1);
    return result;
}

/**
 * Extract call ID from various Stream event formats
 */
function extractCallId(event: Record<string, unknown>): string | null {
    // Try different possible locations for call ID
    if (typeof event.call === "object" && event.call !== null) {
        const call = event.call as { id?: string };
        if (call.id) return call.id;
    }

    if (typeof event.call_cid === "string") {
        const parts = event.call_cid.split(":");
        return parts[1] || parts[0];
    }

    return null;
}

/**
 * Extract duration from call session ended event
 */
function extractCallDuration(event: Record<string, unknown>): number | undefined {
    // Stream can provide duration in various formats
    if (typeof event.call === "object" && event.call !== null) {
        const call = event.call as { session?: { duration_seconds?: number } };
        if (call.session?.duration_seconds) {
            return call.session.duration_seconds;
        }
    }

    if (typeof event.duration === "number") {
        return event.duration;
    }

    if (typeof event.duration_seconds === "number") {
        return event.duration_seconds;
    }

    return undefined;
}

/**
 * Extract participant count from event
 */
function extractParticipantsCount(event: Record<string, unknown>): number | undefined {
    if (typeof event.call === "object" && event.call !== null) {
        const call = event.call as {
            session?: { participants?: unknown[] };
            participants?: unknown[];
        };
        if (Array.isArray(call.session?.participants)) {
            return call.session.participants.length;
        }
        if (Array.isArray(call.participants)) {
            return call.participants.length;
        }
    }

    if (typeof event.participants_count === "number") {
        return event.participants_count;
    }

    return undefined;
}

/**
 * Extract recording metadata from event
 */
function extractRecordingMetadata(event: Record<string, unknown>): {
    url: string | null;
    format?: string;
    size?: number;
    duration?: number;
} {
    const recording = event.recording as Record<string, unknown> | undefined;

    if (!recording) {
        return { url: null };
    }

    return {
        url: typeof recording.url === "string" ? recording.url : null,
        format: typeof recording.format === "string" ? recording.format : undefined,
        size: typeof recording.size === "number" ? recording.size : undefined,
        duration: typeof recording.duration === "number" ? recording.duration : undefined,
    };
}

/**
 * Stream Video Webhook Handler
 * Receives events from Stream and triggers Inngest background jobs
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await request.text();
        const signature = request.headers.get("x-signature") || "";

        // Verify signature in production
        if (process.env.NODE_ENV === "production") {
            if (!verifyWebhookSignature(body, signature)) {
                console.error("[Webhook] Invalid signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }
        }

        const event = JSON.parse(body);
        const eventType = event.type as string;

        console.log(`[Webhook] Received event: ${eventType}`);

        // Handle different event types
        switch (eventType) {
            case "call.session_started":
            case "call.started": {
                const callId = extractCallId(event);
                if (callId) {
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
                        console.log(`[Webhook] Meeting ${updated.id} (callId: ${callId}) → active`);
                    } else {
                        console.warn(`[Webhook] No meeting found for callId: ${callId}`);
                    }
                }
                break;
            }

            case "call.session_ended":
            case "call.ended": {
                const callId = extractCallId(event);
                const duration = extractCallDuration(event);
                const participantsCount = extractParticipantsCount(event);

                if (callId) {
                    const meetingData = await getMeetingByCallId(callId);
                    if (meetingData) {
                        // Trigger background job for processing
                        await inngest.send({
                            name: "meeting/call.ended",
                            data: {
                                callId,
                                meetingId: meetingData.id,
                                duration,
                                participantsCount,
                            },
                        });
                        console.log(`[Webhook] Triggered call.ended job for meeting ${meetingData.id}`);
                        console.log(`[Webhook] Duration: ${duration}s, Participants: ${participantsCount}`);
                    } else {
                        console.warn(`[Webhook] No meeting found for callId: ${callId}`);
                    }
                }
                break;
            }

            case "call.transcription_ready": {
                const callId = extractCallId(event);
                const transcription = event.transcription as { url?: string } | undefined;
                const transcriptUrl = transcription?.url;

                if (callId) {
                    const meetingData = await getMeetingByCallId(callId);
                    if (meetingData) {
                        await inngest.send({
                            name: "meeting/transcription.ready",
                            data: {
                                callId,
                                meetingId: meetingData.id,
                                transcriptUrl,
                            },
                        });
                        console.log(`[Webhook] Triggered transcription.ready job for meeting ${meetingData.id}`);
                    } else {
                        console.warn(`[Webhook] No meeting found for callId: ${callId}`);
                    }
                }
                break;
            }

            case "call.recording_ready": {
                const callId = extractCallId(event);
                const recordingMeta = extractRecordingMetadata(event);

                if (callId && recordingMeta.url) {
                    const meetingData = await getMeetingByCallId(callId);
                    if (meetingData) {
                        await inngest.send({
                            name: "meeting/recording.ready",
                            data: {
                                callId,
                                meetingId: meetingData.id,
                                recordingUrl: recordingMeta.url,
                                format: recordingMeta.format,
                                size: recordingMeta.size,
                                duration: recordingMeta.duration,
                            },
                        });
                        console.log(`[Webhook] Triggered recording.ready job for meeting ${meetingData.id}`);
                    } else {
                        console.warn(`[Webhook] No meeting found for callId: ${callId}`);
                    }
                }
                break;
            }

            case "call.session_participant_joined": {
                const participant = event.participant as { user_id?: string } | undefined;
                console.log("[Webhook] Participant joined:", participant?.user_id);
                break;
            }

            case "call.session_participant_left": {
                const participant = event.participant as { user_id?: string } | undefined;
                console.log("[Webhook] Participant left:", participant?.user_id);
                break;
            }

            case "message.new": {
                // Chat message event — log for analytics
                const messageData = event as {
                    meetingId?: string;
                    role?: string;
                    content?: string;
                };
                console.log("[Webhook] New message:", {
                    meetingId: messageData.meetingId,
                    role: messageData.role,
                    contentLength: messageData.content?.length || 0,
                });
                break;
            }

            default:
                console.log("[Webhook] Unhandled event type:", eventType);
        }

        const processingTime = Date.now() - startTime;
        console.log(`[Webhook] Event ${eventType} processed in ${processingTime}ms`);

        return NextResponse.json({
            received: true,
            eventType,
            processingTime: `${processingTime}ms`,
        });
    } catch (error) {
        console.error("[Webhook] Error processing event:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Health check for webhook endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Stream webhook endpoint is active",
        timestamp: new Date().toISOString(),
        events: [
            "call.session_started",
            "call.session_ended",
            "call.transcription_ready",
            "call.recording_ready",
            "call.session_participant_joined",
            "call.session_participant_left",
            "message.new",
        ],
    });
}
