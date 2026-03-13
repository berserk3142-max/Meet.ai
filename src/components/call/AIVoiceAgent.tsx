"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/trpc/client";

export type AgentStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error" | "unavailable";

/**
 * useAIVoiceAgent — Hook that manages the OpenAI Realtime WebRTC connection.
 * Returns all state needed for UI rendering (status, transcript, controls).
 */
export function useAIVoiceAgent(meetingId: string) {
    const [status, setStatus] = useState<AgentStatus>("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [agentName, setAgentName] = useState("AI Agent");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string[]>([]);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const createSessionMutation = trpc.stream.createRealtimeSession.useMutation();

    const connect = useCallback(async () => {
        try {
            setErrorMessage(null);
            setStatus("connecting");

            // Create session on server
            const session = await createSessionMutation.mutateAsync({ meetingId });
            setAgentName(session.agentName);

            // Create peer connection for WebRTC
            const pc = new RTCPeerConnection();
            peerConnectionRef.current = pc;

            // Set up audio element for AI responses
            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            audioRef.current = audioEl;

            // Handle incoming audio track from AI
            pc.ontrack = (event) => {
                audioEl.srcObject = event.streams[0];
            };

            // Get user's microphone
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = mediaStream;
            mediaStream.getTracks().forEach((track) => {
                pc.addTrack(track, mediaStream);
            });

            // Create data channel for events
            const dataChannel = pc.createDataChannel("oai-events");
            dataChannelRef.current = dataChannel;

            dataChannel.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "response.audio_transcript.done") {
                        setTranscript((prev) => [...prev.slice(-4), `${session.agentName}: ${data.transcript}`]);
                        setStatus("connected");
                    } else if (data.type === "conversation.item.input_audio_transcription.completed") {
                        setTranscript((prev) => [...prev.slice(-4), `You: ${data.transcript}`]);
                    } else if (data.type === "response.audio.delta") {
                        setStatus("speaking");
                    } else if (data.type === "input_audio_buffer.speech_started") {
                        setStatus("listening");
                    } else if (data.type === "session.created") {
                        setStatus("connected");
                    }
                } catch {
                    // Ignore parse errors
                }
            };

            dataChannel.onopen = () => {
                setStatus("connected");
                // Configure session for voice conversations
                dataChannel.send(JSON.stringify({
                    type: "session.update",
                    session: {
                        instructions: session.instructions,
                        input_audio_transcription: { model: "whisper-1" },
                        turn_detection: {
                            type: "server_vad",
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 500,
                        },
                    },
                }));
            };

            // Create and set local description (offer)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Connect to OpenAI Realtime API
            const baseUrl = "https://api.openai.com/v1/realtime";
            const model = "gpt-4o-realtime-preview-2024-12-17";

            const response = await fetch(`${baseUrl}?model=${model}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.ephemeralToken}`,
                    "Content-Type": "application/sdp",
                },
                body: offer.sdp,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[AIVoiceAgent] WebRTC connection failed:", errorText);
                throw new Error("CONNECTION_FAILED");
            }

            // Set remote description (answer)
            const answerSdp = await response.text();
            await pc.setRemoteDescription({
                type: "answer",
                sdp: answerSdp,
            });

        } catch (error: any) {
            console.error("[AIVoiceAgent] Connection error:", error);

            if (error.message?.includes("REALTIME_NOT_AVAILABLE") ||
                createSessionMutation.error?.message?.includes("REALTIME_NOT_AVAILABLE")) {
                setErrorMessage("OpenAI Realtime API is not available on your account. This feature requires GPT-4o Realtime access.");
                setStatus("unavailable");
            } else {
                setErrorMessage("Failed to connect. Please check your microphone permissions and try again.");
                setStatus("error");
            }
        }
    }, [meetingId, createSessionMutation]);

    const disconnect = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.srcObject = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setTranscript([]);
        setStatus("idle");
    }, []);

    const toggleMute = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        status,
        isMuted,
        agentName,
        errorMessage,
        transcript,
        connect,
        disconnect,
        toggleMute,
        isConnecting: createSessionMutation.isPending,
    };
}
