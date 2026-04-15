import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

/**
 * Stream Video webhook handler
 * Receives events from Stream when calls end, transcriptions are ready, etc.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const eventType = body.type;

        console.log(`[Stream Webhook] Received event: ${eventType}`);

        switch (eventType) {
            case "call.ended":
            case "call.session_ended": {
                const callId = body.call?.id || body.call_cid?.split(":")[1];
                const meetingId = body.call?.custom?.meetingId;

                if (callId && meetingId) {
                    await inngest.send({
                        name: "meeting/call.ended",
                        data: {
                            callId,
                            meetingId,
                            duration: body.call?.duration,
                            participantsCount: body.call?.session?.participants?.length,
                        },
                    });
                    console.log(`[Stream Webhook] Triggered call.ended for meeting ${meetingId}`);
                }
                break;
            }

            case "call.transcription_ready": {
                const callId = body.call_cid?.split(":")[1];
                const meetingId = body.call?.custom?.meetingId;

                if (callId && meetingId) {
                    await inngest.send({
                        name: "meeting/transcription.ready",
                        data: {
                            callId,
                            meetingId,
                            transcriptUrl: body.transcription?.url,
                        },
                    });
                    console.log(`[Stream Webhook] Triggered transcription.ready for meeting ${meetingId}`);
                }
                break;
            }

            case "call.recording_ready": {
                const callId = body.call_cid?.split(":")[1];
                const meetingId = body.call?.custom?.meetingId;
                const recordingUrl = body.call_recording?.url;

                if (callId && meetingId && recordingUrl) {
                    await inngest.send({
                        name: "meeting/recording.ready",
                        data: {
                            callId,
                            meetingId,
                            recordingUrl,
                            format: body.call_recording?.format,
                            size: body.call_recording?.size,
                            duration: body.call_recording?.duration,
                        },
                    });
                    console.log(`[Stream Webhook] Triggered recording.ready for meeting ${meetingId}`);
                }
                break;
            }

            default:
                console.log(`[Stream Webhook] Unhandled event type: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[Stream Webhook] Error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
