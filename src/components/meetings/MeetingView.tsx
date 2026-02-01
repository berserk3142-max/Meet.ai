"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Bot, Play, XCircle, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingViewProps {
    meetingId: string;
}

export function MeetingView({ meetingId }: MeetingViewProps) {
    const router = useRouter();
    const utils = trpc.useUtils();

    const { data: meeting, isLoading, error } = trpc.meetings.getById.useQuery({ id: meetingId });

    const updateMutation = trpc.meetings.update.useMutation({
        onSuccess: () => {
            utils.meetings.getById.invalidate({ id: meetingId });
        },
    });

    const deleteMutation = trpc.meetings.delete.useMutation({
        onSuccess: () => {
            router.push("/meetings");
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-white mb-2">Meeting not found</h2>
                <Link href="/meetings" className="text-zinc-400 hover:text-white underline">
                    Return to meetings
                </Link>
            </div>
        );
    }

    const handleStart = () => {
        updateMutation.mutate({
            id: meetingId,
            data: {
                status: "active",
                startedAt: new Date(),
            },
        });
    };

    const handleCancel = () => {
        if (confirm("Are you sure you want to cancel this meeting?")) {
            updateMutation.mutate({
                id: meetingId,
                data: {
                    status: "cancelled",
                    endedAt: new Date(),
                },
            });
        }
    };

    const handleComplete = () => {
        updateMutation.mutate({
            id: meetingId,
            data: {
                status: "completed",
                endedAt: new Date(),
            },
        });
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this meeting permanently?")) {
            deleteMutation.mutate({ id: meetingId });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            upcoming: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            completed: "bg-green-500/10 text-green-400 border-green-500/20",
            processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return (
            <span className={cn("px-3 py-1 text-sm font-medium rounded-full border", styles[status] || styles.upcoming)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-4 text-zinc-400 text-sm">
                <Link href="/meetings" className="hover:text-white transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back to meetings
                </Link>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-200">Meeting Details</span>
            </div>

            {/* Main Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">{meeting.name}</h1>
                            <StatusBadge status={meeting.status} />
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(meeting.createdAt).toLocaleDateString()}
                            </div>
                            {meeting.duration && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {Math.round(meeting.duration / 1000 / 60)} mins
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {meeting.status === "upcoming" && (
                            <Button onClick={handleStart} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Play className="w-4 h-4 mr-2" />
                                Start Meeting
                            </Button>
                        )}
                        {meeting.status === "active" && (
                            <Button onClick={handleComplete} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Complete
                            </Button>
                        )}
                        {(meeting.status === "upcoming" || meeting.status === "active") && (
                            <Button onClick={handleCancel} disabled={updateMutation.isPending} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                        {(meeting.status === "cancelled" || meeting.status === "completed") && (
                            <Button onClick={handleDelete} disabled={deleteMutation.isPending} variant="outline" className="border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-900/50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Description/Summary Placeholder */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Summary</h3>
                            <div className="bg-zinc-950/50 rounded-lg p-6 border border-zinc-800/50 min-h-[200px] text-zinc-500 italic">
                                {meeting.status === "completed"
                                    ? "Meeting summary will appear here..."
                                    : "Summary will be generated after the meeting is completed."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Agent Info */}
                    <div className="space-y-6">
                        <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Assigned Agent</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{meeting.agent?.name}</div>
                                    <div className="text-xs text-zinc-500 mt-1 capitalize">{meeting.agent?.status || "Inactive"}</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <Link href={meeting.agentId ? `/agents/${meeting.agentId}` : "#"} className="text-sm text-blue-400 hover:underline">
                                    View Agent Details →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
