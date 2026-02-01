import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { meetingEventsService } from "@/modules/meetings/meetings.events";

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
 * Stream Video Webhook Handler
 * Receives events from Stream when call state changes
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
                    await meetingEventsService.onCallStarted(callId);
                }
                break;
            }

            case "call.session_ended":
            case "call.ended": {
                const callId = event.call?.id || event.call_cid?.split(":")[1];
                if (callId) {
                    await meetingEventsService.onCallEnded(callId);
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
