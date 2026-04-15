"use client";

import { use, useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { ArrowLeft, Phone, PhoneOff, Loader2, Video, Mic, MicOff, VideoOff } from "lucide-react";

interface MeetingCallPageProps {
    params: Promise<{ id: string }>;
}

export default function MeetingCallPage({ params }: MeetingCallPageProps) {
    const { id } = use(params);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const { data: meeting, isLoading, error } = trpc.meetings.getById.useQuery({ id });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <div className="text-center">
                    <p className="text-zinc-400 text-lg mb-4">Meeting not found</p>
                    <Link href="/meetings" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to meetings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/meetings/${id}`}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-white font-semibold">{meeting.name}</h1>
                        <span className="text-xs text-zinc-500">Meeting Call</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        {meeting.status === "active" ? "Live" : meeting.status}
                    </span>
                </div>
            </div>

            {/* Main video area */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl">
                    {meeting.callId ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <Video className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                                <p className="text-zinc-400 text-lg mb-2">Stream Video Call</p>
                                <p className="text-zinc-600 text-sm">
                                    Call ID: {meeting.callId}
                                </p>
                                <p className="text-zinc-600 text-sm mt-4">
                                    Stream Video SDK integration required for live video.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <Phone className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-400 text-lg mb-2">No active call</p>
                                <p className="text-zinc-600 text-sm">
                                    This meeting doesn&apos;t have an active call ID yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-center gap-4 py-6 border-t border-zinc-800">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-colors ${
                        isMuted
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full transition-colors ${
                        isVideoOff
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <Link
                    href={`/meetings/${id}`}
                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                    <PhoneOff className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
