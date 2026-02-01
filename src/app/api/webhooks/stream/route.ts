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

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
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
 * Stream Video Webhook Handler
 * Receives events from Stream and triggers Inngest background jobs
 */
export async function POST(request: NextRequest) {
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
        console.log("[Webhook] Received event:", event.type);

        // Handle different event types
        switch (event.type) {
            case "call.session_started":
            case "call.started": {
                const callId = event.call?.id || event.call_cid?.split(":")[1];
                if (callId) {
                    // Update meeting status directly (quick operation)
                    await db
                        .update(meeting)
                        .set({
                            status: "active",
                            startedAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(meeting.callId, callId));
                    console.log(`[Webhook] Meeting with callId ${callId} → active`);
                }
                break;
            }

            case "call.session_ended":
            case "call.ended": {
                const callId = event.call?.id || event.call_cid?.split(":")[1];
                if (callId) {
                    const meetingData = await getMeetingByCallId(callId);
                    if (meetingData) {
                        // Trigger background job for processing
                        await inngest.send({
                            name: "meeting/call.ended",
                            data: {
                                callId,
                                meetingId: meetingData.id,
                            },
                        });
                        console.log(`[Webhook] Triggered background job for meeting ${meetingData.id}`);
                    }
                }
                break;
            }

            case "call.transcription_ready": {
                const callId = event.call?.id || event.call_cid?.split(":")[1];
                const transcriptUrl = event.transcription?.url;
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
                        console.log(`[Webhook] Transcription ready for meeting ${meetingData.id}`);
                    }
                }
                break;
            }

            case "call.recording_ready": {
                const callId = event.call?.id || event.call_cid?.split(":")[1];
                const recordingUrl = event.recording?.url;
                if (callId && recordingUrl) {
                    const meetingData = await getMeetingByCallId(callId);
                    if (meetingData) {
                        await inngest.send({
                            name: "meeting/recording.ready",
                            data: {
                                callId,
                                meetingId: meetingData.id,
                                recordingUrl,
                            },
                        });
                        console.log(`[Webhook] Recording ready for meeting ${meetingData.id}`);
                    }
                }
                break;
            }

            case "call.session_participant_joined": {
                console.log("[Webhook] Participant joined:", event.participant?.user_id);
                break;
            }

            case "call.session_participant_left": {
                console.log("[Webhook] Participant left:", event.participant?.user_id);
                break;
            }

            default:
                console.log("[Webhook] Unhandled event type:", event.type);
        }

        return NextResponse.json({ received: true });
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
    });
}
