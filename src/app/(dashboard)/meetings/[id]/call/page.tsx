"use client";

import { use, useState, useEffect, useRef } from "react";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { ArrowLeft, PhoneOff, Loader2, Mic, MicOff, Bot, Volume2 } from "lucide-react";

interface MeetingCallPageProps {
    params: Promise<{ id: string }>;
}

export default function MeetingCallPage({ params }: MeetingCallPageProps) {
    const { id } = use(params);
    const [isMuted, setIsMuted] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
    const [statusText, setStatusText] = useState("Initializing...");

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const initRef = useRef(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const { data: meeting, isLoading, error: meetingError } = trpc.meetings.getById.useQuery({ id });
    const { data: realtimeSession, error: tokenError } = trpc.meetings.getRealtimeToken.useQuery(
        { meetingId: id },
        { enabled: !!meeting, retry: false }
    );
    const startMeeting = trpc.meetings.update.useMutation();

    // Handle meeting fetch error
    useEffect(() => {
        if (meetingError) {
            setError("Meeting not found. It may belong to a different account.");
            setIsConnecting(false);
        }
    }, [meetingError]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    // Main effect: setup camera + connect to OpenAI Realtime
    useEffect(() => {
        if (!realtimeSession || initRef.current) return;
        initRef.current = true;

        const init = async () => {
            try {
                // Step 1: Get mic (camera optional)
                setStatusText("Requesting microphone...");
                let stream: MediaStream | null = null;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                } catch {
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                        console.log("[Call] No camera, using audio only");
                    } catch {
                        console.warn("[Call] No media devices, proceeding without mic");
                    }
                }
                mediaStreamRef.current = stream;
                if (videoRef.current && stream?.getVideoTracks().length) {
                    videoRef.current.srcObject = stream;
                }

                // Step 2: Create WebRTC connection
                setStatusText("Connecting to AI agent...");
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                // Audio output from AI
                const audioEl = document.createElement("audio");
                audioEl.autoplay = true;
                document.body.appendChild(audioEl);

                pc.ontrack = (e) => {
                    audioEl.srcObject = e.streams[0];

                    // Detect AI speaking via audio levels
                    try {
                        const ctx = new AudioContext();
                        const source = ctx.createMediaStreamSource(e.streams[0]);
                        const analyser = ctx.createAnalyser();
                        analyser.fftSize = 256;
                        source.connect(analyser);
                        const dataArray = new Uint8Array(analyser.frequencyBinCount);
                        const check = () => {
                            if (!pcRef.current) return;
                            analyser.getByteFrequencyData(dataArray);
                            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                            setIsAiSpeaking(avg > 8);
                            requestAnimationFrame(check);
                        };
                        check();
                    } catch (e) {
                        console.warn("Audio analysis not available:", e);
                    }
                };

                // Add user's audio track to WebRTC
                const audioTrack = stream?.getAudioTracks()[0];
                if (audioTrack && stream) {
                    pc.addTrack(audioTrack, stream);
                }

                // Data channel for events/transcript
                const dc = pc.createDataChannel("oai-events");

                dc.onopen = () => {
                    console.log("[Call] Data channel open — sending session config");
                    dc.send(JSON.stringify({
                        type: "session.update",
                        session: {
                            instructions: realtimeSession.instructions,
                            voice: "alloy",
                            input_audio_transcription: { model: "whisper-1" },
                            turn_detection: { type: "server_vad" },
                        },
                    }));
                };

                dc.onmessage = (e) => {
                    try {
                        const event = JSON.parse(e.data);
                        if (event.type === "response.audio_transcript.done" && event.transcript) {
                            setTranscript(prev => [...prev, { role: "ai", text: event.transcript }]);
                        }
                        if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
                            setTranscript(prev => [...prev, { role: "user", text: event.transcript }]);
                        }
                    } catch { }
                };

                // Step 3: Create and send SDP offer
                setStatusText("Establishing voice connection...");
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const response = await fetch(
                    "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${realtimeSession.ephemeralToken}`,
                            "Content-Type": "application/sdp",
                        },
                        body: offer.sdp,
                    }
                );

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`OpenAI Realtime error ${response.status}: ${errText}`);
                }

                const answerSdp = await response.text();
                await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

                // Update meeting status
                if (meeting?.status === "upcoming") {
                    startMeeting.mutate({ id: meeting.id, data: { status: "active" } });
                }

                setIsCallActive(true);
                setIsConnecting(false);
                setStatusText("Connected");
                console.log("[Call] ✅ Connected to OpenAI Realtime");

            } catch (err: any) {
                console.error("[Call] Connection failed:", err);
                setError(err.message || "Failed to connect");
                setIsConnecting(false);
            }
        };

        init();

        return () => {
            pcRef.current?.close();
            pcRef.current = null;
            mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [realtimeSession]);

    // Handle token error
    useEffect(() => {
        if (tokenError) {
            setError(tokenError.message || "Failed to get AI session token");
            setIsConnecting(false);
        }
    }, [tokenError]);

    const toggleMute = () => {
        const audioTrack = mediaStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const endCall = () => {
        pcRef.current?.close();
        pcRef.current = null;
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        setCallEnded(true);
        setIsCallActive(false);
    };

    if (isLoading) {
        return (
            <div style={styles.centered}>
                <Loader2 className="animate-spin" style={{ width: "3rem", height: "3rem", color: "#8B5CF6" }} />
                <p style={{ color: "#fff", fontWeight: 600, marginTop: "1rem" }}>Loading meeting...</p>
            </div>
        );
    }

    if (callEnded) {
        return (
            <div style={styles.centered}>
                <div style={{ backgroundColor: "#18181b", border: "3px solid #27272a", padding: "3rem", textAlign: "center", maxWidth: "28rem" }}>
                    <PhoneOff style={{ width: "3rem", height: "3rem", color: "#8B5CF6", margin: "0 auto 1rem" }} />
                    <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Call Ended</h2>
                    <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>Summary and transcript will be processed shortly.</p>
                    <Link href={`/meetings/${id}`} style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.5rem", backgroundColor: "#8B5CF6",
                        color: "#fff", border: "2px solid #000", fontWeight: 700, textDecoration: "none",
                    }}>View Meeting Details</Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centered}>
                <div style={{ backgroundColor: "#18181b", border: "2px solid #dc2626", padding: "2rem", textAlign: "center", maxWidth: "32rem" }}>
                    <p style={{ color: "#fff", fontWeight: 600, marginBottom: "0.5rem" }}>Connection Failed</p>
                    <p style={{ color: "#71717a", fontSize: "0.875rem", marginBottom: "1rem", wordBreak: "break-word" }}>{error}</p>
                    <Link href={`/meetings/${id}`} style={{ color: "#8B5CF6", fontWeight: 600, textDecoration: "none" }}>← Back to meeting</Link>
                </div>
            </div>
        );
    }

    const agentName = meeting?.agent?.name || "AI Agent";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#0a0a0a" }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1.5rem", borderBottom: "1px solid #27272a", backgroundColor: "#18181b",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href={`/meetings/${id}`} style={{ color: "#71717a" }}>
                        <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} />
                    </Link>
                    <div>
                        <h1 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>{meeting?.name || "Meeting"}</h1>
                        <span style={{ color: "#71717a", fontSize: "0.75rem" }}>with {agentName}</span>
                    </div>
                </div>
                {isCallActive && (
                    <span style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.375rem 0.75rem", backgroundColor: "#22c55e20",
                        border: "1px solid #22c55e40", borderRadius: "9999px",
                        color: "#22c55e", fontSize: "0.75rem", fontWeight: 600,
                    }}>
                        <span style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#22c55e", borderRadius: "50%" }} />
                        Live
                    </span>
                )}
            </div>

            {/* Split screen */}
            <div style={{ flex: 1, display: "flex", gap: "2px", overflow: "hidden" }}>
                {/* LEFT: User video or avatar */}
                <div style={{ flex: 1, position: "relative", backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: mediaStreamRef.current?.getVideoTracks().length ? "block" : "none" }} />
                    {(!mediaStreamRef.current?.getVideoTracks().length) && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "8rem", height: "8rem", borderRadius: "50%", background: "linear-gradient(135deg, #3f3f46, #52525b)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #27272a" }}>
                                <Mic style={{ width: "3rem", height: "3rem", color: isMuted ? "#dc2626" : "#a1a1aa" }} />
                            </div>
                            <p style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>Audio Only</p>
                        </div>
                    )}
                    <div style={{ position: "absolute", bottom: "1rem", left: "1rem", backgroundColor: "rgba(0,0,0,0.7)", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
                        You {isMuted && "🔇"}
                    </div>
                </div>

                {/* RIGHT: AI Agent */}
                <div style={{ flex: 1, position: "relative", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                    {/* Animated avatar */}
                    <div style={{ position: "relative", width: "12rem", height: "12rem" }}>
                        <div style={{ position: "absolute", inset: "-0.75rem", borderRadius: "50%", border: `3px solid ${isAiSpeaking ? "#8B5CF6" : "#27272a"}`, animation: isAiSpeaking ? "pulse-ring 1.5s ease-in-out infinite" : "none", transition: "border-color 0.3s" }} />
                        <div style={{ position: "absolute", inset: "-0.25rem", borderRadius: "50%", border: `2px solid ${isAiSpeaking ? "#a78bfa" : "#1e1e1e"}`, animation: isAiSpeaking ? "pulse-ring 1.5s ease-in-out infinite 0.3s" : "none" }} />
                        <div style={{
                            width: "100%", height: "100%", borderRadius: "50%",
                            background: isAiSpeaking ? "linear-gradient(135deg, #8B5CF6, #ec4899, #8B5CF6)" : "linear-gradient(135deg, #27272a, #3f3f46)",
                            backgroundSize: "200% 200%", animation: isAiSpeaking ? "gradient-shift 2s ease infinite" : "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "3px solid #27272a", transition: "all 0.3s ease",
                        }}>
                            <Bot style={{ width: "4rem", height: "4rem", color: isAiSpeaking ? "#fff" : "#71717a", transition: "color 0.3s" }} />
                        </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>{agentName}</p>
                        <p style={{ color: isAiSpeaking ? "#8B5CF6" : "#71717a", fontSize: "0.875rem", fontWeight: 500, marginTop: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                            {isConnecting ? (
                                <><Loader2 className="animate-spin" style={{ width: "0.875rem", height: "0.875rem" }} /> {statusText}</>
                            ) : isAiSpeaking ? (
                                <><Volume2 style={{ width: "0.875rem", height: "0.875rem" }} /> Speaking...</>
                            ) : (
                                <><Mic style={{ width: "0.875rem", height: "0.875rem" }} /> Listening...</>
                            )}
                        </p>
                    </div>

                    {/* Live transcript */}
                    {transcript.length > 0 && (
                        <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem", maxHeight: "8rem", overflowY: "auto", backgroundColor: "rgba(0,0,0,0.85)", borderRadius: "0.5rem", padding: "0.75rem" }}>
                            {transcript.slice(-4).map((t, i) => (
                                <p key={i} style={{ fontSize: "0.8rem", marginBottom: "0.25rem", color: t.role === "ai" ? "#a78bfa" : "#d1d5db" }}>
                                    <strong>{t.role === "ai" ? agentName : "You"}:</strong> {t.text}
                                </p>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "1.25rem", borderTop: "1px solid #27272a", backgroundColor: "#18181b" }}>
                <button onClick={toggleMute} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", borderRadius: "50%", cursor: "pointer", backgroundColor: isMuted ? "#dc262640" : "#27272a", border: isMuted ? "2px solid #dc2626" : "2px solid #3f3f46" }}>
                    {isMuted ? <MicOff style={{ width: "1.25rem", height: "1.25rem", color: "#dc2626" }} /> : <Mic style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />}
                </button>
                <button onClick={endCall} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem 2rem", borderRadius: "9999px", cursor: "pointer", backgroundColor: "#dc2626", border: "2px solid #dc2626" }}>
                    <PhoneOff style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
                </button>
            </div>

            <style>{`
                @keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }
                @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0a0a0a" },
};
