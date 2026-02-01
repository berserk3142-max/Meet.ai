"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ArrowLeft, Calendar, Clock, Bot } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    UpcomingMeetingView,
    ActiveMeetingView,
    ProcessingMeetingView,
    CompletedMeetingView,
    CancelledMeetingView,
} from "./MeetingStateViews";

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

    // Action handlers
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
                status: "processing",  // Go to processing first
                endedAt: new Date(),
            },
        });
        // Simulate processing completion after 3 seconds (in production, this would be a webhook)
        setTimeout(() => {
            updateMutation.mutate({
                id: meetingId,
                data: {
                    status: "completed",
                },
            });
        }, 3000);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this meeting permanently?")) {
            deleteMutation.mutate({ id: meetingId });
        }
    };

    // Status badge component
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

    // Render state-specific content
    const renderStateContent = () => {
        const meetingData = {
            id: meeting.id,
            name: meeting.name,
            status: meeting.status,
            createdAt: meeting.createdAt,
            startedAt: meeting.startedAt,
            endedAt: meeting.endedAt,
            agent: meeting.agent,
        };

        const isLoading = updateMutation.isPending || deleteMutation.isPending;

        switch (meeting.status) {
            case "upcoming":
                return (
                    <UpcomingMeetingView
                        meeting={meetingData}
                        onStart={handleStart}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                    />
                );
            case "active":
                return (
                    <ActiveMeetingView
                        meeting={meetingData}
                        onComplete={handleComplete}
                        isLoading={isLoading}
                    />
                );
            case "processing":
                return <ProcessingMeetingView meeting={meetingData} />;
            case "completed":
                return (
                    <CompletedMeetingView
                        meeting={meetingData}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                );
            case "cancelled":
                return (
                    <CancelledMeetingView
                        meeting={meetingData}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                );
            default:
                return (
                    <UpcomingMeetingView
                        meeting={meetingData}
                        onStart={handleStart}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                    />
                );
        }
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

            {/* Main Content Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-zinc-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

                        {/* Agent Info (Compact) */}
                        <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{meeting.agent?.name || "No Agent"}</div>
                                <div className="text-xs text-zinc-500 capitalize">{meeting.agent?.status || "inactive"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* State-specific Content */}
                <div className="p-6 md:p-8">
                    {renderStateContent()}
                </div>
            </div>
        </div>
    );
}
