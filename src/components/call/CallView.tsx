"use client";

import { useEffect, useState } from "react";
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    CallingState,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { trpc } from "@/trpc/client";
import { Loader2, PhoneOff, AlertCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CallViewProps {
    meetingId: string;
    callId: string;
}

export function CallView({ meetingId, callId }: CallViewProps) {
    const router = useRouter();
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [agentJoined, setAgentJoined] = useState(false);

    const { data: tokenData, isLoading: tokenLoading, error: tokenError } = trpc.stream.generateToken.useQuery();

    // Mutation to add AI agent to call
    const addAgentMutation = trpc.stream.addAgentToCall.useMutation({
        onSuccess: (data) => {
            console.log(`[Call] AI Agent ${data.agentName} joined the call`);
            setAgentJoined(true);
        },
        onError: (err) => {
            console.error("[Call] Failed to add AI agent:", err);
        },
    });

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

    useEffect(() => {
        if (!tokenData || !apiKey) return;

        const initCall = async () => {
            try {
                // Initialize Stream Video client
                const streamClient = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: tokenData.userId,
                        name: tokenData.userName,
                        image: tokenData.userImage,
                    },
                    token: tokenData.token,
                });

                setClient(streamClient);

                // Create or join the call
                const streamCall = streamClient.call("default", callId);
                await streamCall.join({ create: true });

                setCall(streamCall);

                // Add AI agent to the call
                addAgentMutation.mutate({ meetingId, callId });
            } catch (err) {
                console.error("Failed to initialize call:", err);
                setError("Failed to connect to video call. Please try again.");
            }
        };

        initCall();

        // Cleanup on unmount
        return () => {
            if (call) {
                call.leave();
            }
            if (client) {
                client.disconnectUser();
            }
        };
    }, [tokenData, apiKey, callId]);

    const handleLeave = async () => {
        if (call) {
            await call.leave();
        }
        if (client) {
            await client.disconnectUser();
        }
        router.push(`/meetings/${meetingId}`);
    };

    // Loading state
    if (tokenLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <p className="text-zinc-400">Preparing video call...</p>
            </div>
        );
    }

    // Error state
    if (tokenError || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Connection Error</h2>
                <p className="text-zinc-400">{error || "Failed to generate call token"}</p>
                <Button onClick={() => router.push(`/meetings/${meetingId}`)} variant="outline">
                    Return to Meeting
                </Button>
            </div>
        );
    }

    // Waiting for client to initialize
    if (!client || !call) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="text-zinc-400">Connecting to video call...</p>
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <CallUI onLeave={handleLeave} meetingId={meetingId} />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
}

// Inner component that uses call hooks
function CallUI({ onLeave, meetingId }: { onLeave: () => void; meetingId: string }) {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const router = useRouter();

    if (callingState === CallingState.LEFT) {
        router.push(`/meetings/${meetingId}`);
        return null;
    }

    return (
        <div className="h-[calc(100vh-100px)] flex bg-zinc-950 rounded-xl overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col">
                {/* Video Layout */}
                <div className="flex-1 relative">
                    <SpeakerLayout />
                </div>

                {/* Controls */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                    <div className="flex items-center justify-center gap-4">
                        <CallControls onLeave={onLeave} />
                    </div>
                </div>

                {/* Leave Button (Fallback) */}
                <div className="absolute top-4 right-4 z-50">
                    <Button
                        onClick={onLeave}
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        Leave Call
                    </Button>
                </div>
            </div>

            {/* AI Agent Sidebar */}
            <div className="w-80 border-l border-zinc-800 p-4 bg-zinc-900/50 flex flex-col">
                <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Voice Assistant
                </h3>
                <AIVoiceAgent meetingId={meetingId} />
            </div>
        </div>
    );
}

// Import AIVoiceAgent
import { AIVoiceAgent } from "./AIVoiceAgent";

