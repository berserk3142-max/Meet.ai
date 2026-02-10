"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { Bot, Mic, MicOff, Volume2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIVoiceAgentProps {
    meetingId: string;
    onStatusChange?: (status: "connecting" | "connected" | "speaking" | "listening" | "error") => void;
}

type AgentStatus = "idle" | "connecting" | "connected" | "speaking" | "listening" | "error" | "unavailable";

/**
 * AIVoiceAgent - Connects to OpenAI Realtime API for voice conversation
 * Uses WebRTC for audio streaming
 */
export function AIVoiceAgent({ meetingId, onStatusChange }: AIVoiceAgentProps) {
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

    const updateStatus = useCallback((newStatus: AgentStatus) => {
        setStatus(newStatus);
        if (newStatus !== "unavailable" && newStatus !== "error") {
            onStatusChange?.(newStatus as any);
        }
    }, [onStatusChange]);

    const connectToAgent = useCallback(async () => {
        try {
            setErrorMessage(null);
            updateStatus("connecting");

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
                        setTranscript((prev) => [...prev.slice(-4), `${agentName}: ${data.transcript}`]);
                        updateStatus("connected");
                    } else if (data.type === "conversation.item.input_audio_transcription.completed") {
                        setTranscript((prev) => [...prev.slice(-4), `You: ${data.transcript}`]);
                    } else if (data.type === "response.audio.delta") {
                        updateStatus("speaking");
                    } else if (data.type === "input_audio_buffer.speech_started") {
                        updateStatus("listening");
                    } else if (data.type === "session.created") {
                        updateStatus("connected");
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            };

            dataChannel.onopen = () => {
                updateStatus("connected");
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

            // Check for specific error types
            if (error.message?.includes("REALTIME_NOT_AVAILABLE") ||
                createSessionMutation.error?.message?.includes("REALTIME_NOT_AVAILABLE")) {
                setErrorMessage("OpenAI Realtime API is not available on your account. This feature requires GPT-4o Realtime access.");
                updateStatus("unavailable");
            } else {
                setErrorMessage("Failed to connect. Please check your microphone permissions and try again.");
                updateStatus("error");
            }
        }
    }, [meetingId, createSessionMutation, updateStatus, agentName]);

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
        updateStatus("idle");
    }, [updateStatus]);

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

    return (
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status === "connected" || status === "speaking" || status === "listening"
                            ? "bg-emerald-500/20"
                            : status === "unavailable" || status === "error"
                                ? "bg-red-500/20"
                                : "bg-zinc-700"
                        }`}>
                        {status === "unavailable" || status === "error" ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                            <Bot className={`w-5 h-5 ${status === "speaking" ? "text-emerald-400 animate-pulse" : "text-zinc-400"
                                }`} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-white">{agentName}</h3>
                        <p className="text-xs text-zinc-400">
                            {status === "idle" && "Click to connect"}
                            {status === "connecting" && "Connecting..."}
                            {status === "connected" && "Ready to talk"}
                            {status === "speaking" && "Speaking..."}
                            {status === "listening" && "Listening..."}
                            {status === "error" && "Connection failed"}
                            {status === "unavailable" && "Not available"}
                        </p>
                    </div>
                </div>

                {/* Audio indicator */}
                {(status === "speaking" || status === "listening") && (
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full animate-pulse ${status === "speaking" ? "bg-emerald-400" : "bg-blue-400"
                                    }`}
                                style={{
                                    height: `${8 + Math.random() * 16}px`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Error message */}
            {errorMessage && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <p className="text-xs text-red-400">{errorMessage}</p>
                </div>
            )}

            {/* Transcript */}
            {transcript.length > 0 && (
                <div className="max-h-32 overflow-y-auto bg-zinc-950 rounded-lg p-3 text-sm space-y-1">
                    {transcript.map((line, i) => (
                        <p key={i} className={line.startsWith("You:") ? "text-blue-400" : "text-emerald-400"}>
                            {line}
                        </p>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
                {status === "idle" || status === "error" || status === "unavailable" ? (
                    <Button
                        onClick={connectToAgent}
                        className={`flex-1 ${status === "unavailable"
                                ? "bg-zinc-700 hover:bg-zinc-600"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            } text-white`}
                        disabled={createSessionMutation.isPending}
                    >
                        {createSessionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Bot className="w-4 h-4 mr-2" />
                        )}
                        {status === "error" ? "Retry" : status === "unavailable" ? "Try Again" : "Connect to AI"}
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={toggleMute}
                            variant="outline"
                            size="icon"
                            className={isMuted ? "border-red-700 text-red-400" : "border-zinc-600"}
                        >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button
                            onClick={disconnect}
                            variant="outline"
                            className="flex-1 border-zinc-600 text-zinc-300"
                        >
                            Disconnect
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
