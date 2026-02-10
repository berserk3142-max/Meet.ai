"use client";

import { Clock, Play, Loader2, CheckCircle2, XCircle, Calendar, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types
interface MeetingData {
    id: string;
    name: string;
    status: string;
    callId?: string | null;
    recordingUrl?: string | null;
    createdAt: Date;
    startedAt: Date | null;
    endedAt: Date | null;
    agent: {
        name: string;
        status: string;
    } | null;
}

interface StateViewProps {
    meeting: MeetingData;
    onStart?: () => void;
    onCancel?: () => void;
    onComplete?: () => void;
    onDelete?: () => void;
    isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING STATE
// ─────────────────────────────────────────────────────────────────────────────
export function UpcomingMeetingView({ meeting, onStart, onCancel, isLoading }: StateViewProps) {
    return (
        <div className="space-y-6">
            {/* State Indicator */}
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-yellow-400">Upcoming Meeting</h3>
                    <p className="text-sm text-zinc-400">
                        Scheduled for {new Date(meeting.createdAt).toLocaleDateString()} at{" "}
                        {new Date(meeting.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Illustration Placeholder */}
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6">
                    <Calendar className="w-12 h-12 text-yellow-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to Start</h3>
                <p className="text-zinc-400 text-center max-w-md mb-8">
                    Your meeting with <span className="text-white font-medium">{meeting.agent?.name || "Agent"}</span> is ready.
                    Click the button below to begin.
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={onStart}
                        disabled={isLoading}
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Meeting
                    </Button>
                    <Button
                        onClick={onCancel}
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE STATE
// ─────────────────────────────────────────────────────────────────────────────
export function ActiveMeetingView({ meeting, onComplete, isLoading }: StateViewProps) {
    return (
        <div className="space-y-6">
            {/* State Indicator */}
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-400" />
                    </div>
                    {/* Pulsing Live Indicator */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                        Live Meeting
                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full font-medium">LIVE</span>
                    </h3>
                    <p className="text-sm text-zinc-400">
                        Started at {meeting.startedAt ? new Date(meeting.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </p>
                </div>
            </div>

            {/* Active Meeting Content */}
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-blue-950/30 to-zinc-950/50 rounded-xl border border-blue-500/20">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mb-6 animate-pulse">
                    <Video className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Meeting in Progress</h3>
                <p className="text-zinc-400 text-center max-w-md mb-8">
                    Your AI agent <span className="text-white font-medium">{meeting.agent?.name || "Agent"}</span> is actively
                    listening and taking notes.
                </p>
                <div className="flex items-center gap-3">
                    {meeting.callId && (
                        <Link href={`/meetings/${meeting.id}/call`}>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                                <Video className="w-5 h-5 mr-2" />
                                Join Video Call
                            </Button>
                        </Link>
                    )}
                    <Button
                        onClick={onComplete}
                        disabled={isLoading}
                        size="lg"
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        End Meeting
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESSING STATE
// ─────────────────────────────────────────────────────────────────────────────
export function ProcessingMeetingView({ meeting }: StateViewProps) {
    return (
        <div className="space-y-6">
            {/* State Indicator */}
            <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-purple-400">Processing</h3>
                    <p className="text-sm text-zinc-400">
                        Meeting ended at {meeting.endedAt ? new Date(meeting.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </p>
                </div>
            </div>

            {/* Processing Content */}
            <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-purple-950/20 to-zinc-950/50 rounded-xl border border-purple-500/20">
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                    </div>
                    {/* Orbiting dots */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-purple-400"></div>
                    </div>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Processing Your Meeting</h3>
                <p className="text-zinc-400 text-center max-w-md">
                    Our AI is analyzing the conversation, generating insights, and preparing your summary.
                    This usually takes a few moments...
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETED STATE
// ─────────────────────────────────────────────────────────────────────────────
export function CompletedMeetingView({ meeting, onDelete, isLoading }: StateViewProps) {
    return (
        <div className="space-y-6">
            {/* State Indicator */}
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-green-400">Meeting Completed</h3>
                        <p className="text-sm text-zinc-400">
                            Finished on {meeting.endedAt ? new Date(meeting.endedAt).toLocaleDateString() : "—"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onDelete}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                    Delete Meeting
                </Button>
            </div>

            {/* Tabs for Summary, Transcript, Recording */}
            <MeetingTabsComponent meetingId={meeting.id} recordingUrl={meeting.recordingUrl} />
        </div>
    );
}

// Import MeetingTabs dynamically to avoid circular dependencies
import { MeetingTabs as MeetingTabsComponent } from "./MeetingTabs";

// ─────────────────────────────────────────────────────────────────────────────
// CANCELLED STATE
// ─────────────────────────────────────────────────────────────────────────────
export function CancelledMeetingView({ meeting, onDelete, isLoading }: StateViewProps) {
    return (
        <div className="space-y-6">
            {/* State Indicator */}
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-red-400">Meeting Cancelled</h3>
                    <p className="text-sm text-zinc-400">
                        This meeting was cancelled and cannot be started.
                    </p>
                </div>
            </div>

            {/* Cancelled Illustration */}
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/10 to-zinc-800/50 flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-red-400/50" />
                </div>
                <h3 className="text-xl font-medium text-zinc-400 mb-2">This Meeting Was Cancelled</h3>
                <p className="text-zinc-500 text-center max-w-md mb-8">
                    No further actions can be taken on this meeting.
                    You can delete it to clean up your records.
                </p>
                <Button
                    onClick={onDelete}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                    Delete Meeting
                </Button>
            </div>
        </div>
    );
}
