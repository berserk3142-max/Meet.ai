"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { MeetingsDataTable, MeetingDialog } from "@/components/meetings";
import { Video, Plus, Loader2 } from "lucide-react";
import type { CreateMeetingInput } from "@/modules/meetings";

export default function MeetingsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Fetch meetings
    const { data: meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = trpc.meetings.getAll.useQuery();

    // Fetch agents for the meeting form
    const { data: agents, isLoading: agentsLoading } = trpc.agents.getAll.useQuery();

    // Create mutation
    const createMutation = trpc.meetings.create.useMutation({
        onSuccess: () => {
            setIsCreateDialogOpen(false);
            refetchMeetings();
        },
    });

    const handleCreate = (data: CreateMeetingInput) => {
        createMutation.mutate(data);
    };

    const isLoading = meetingsLoading || agentsLoading;

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Meetings</h1>
                        <p className="text-zinc-400">Manage your video meetings and recordings.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateDialogOpen(true)}
                        disabled={!agents || agents.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        New Meeting
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-400">Loading meetings...</p>
                    </div>
                )}

                {/* Meeting Stats */}
                {!isLoading && meetings && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="text-sm text-zinc-400 mb-1">Total Meetings</div>
                            <div className="text-2xl font-bold text-white">{meetings.length}</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="text-sm text-zinc-400 mb-1">Upcoming</div>
                            <div className="text-2xl font-bold text-yellow-400">
                                {meetings.filter(m => m.status === "upcoming").length}
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="text-sm text-zinc-400 mb-1">Completed</div>
                            <div className="text-2xl font-bold text-green-400">
                                {meetings.filter(m => m.status === "completed").length}
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="text-sm text-zinc-400 mb-1">Active Agents</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {agents?.filter(a => a.status === "active").length || 0}
                            </div>
                        </div>
                    </div>
                )}

                {/* Meetings Table */}
                {!isLoading && meetings && agents && (
                    <MeetingsDataTable
                        meetings={meetings}
                        agents={agents}
                        onRefresh={refetchMeetings}
                    />
                )}

                {/* No Agents Warning */}
                {!isLoading && agents && agents.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <p className="text-yellow-400 text-sm">
                            ⚠️ You need to create at least one agent before you can create meetings.
                            <a href="/agents" className="underline ml-1 hover:text-yellow-300">Go to Agents →</a>
                        </p>
                    </div>
                )}

                {/* Create Dialog */}
                <MeetingDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => {
                        setIsCreateDialogOpen(false);
                        createMutation.reset();
                    }}
                    mode="create"
                    agents={agents || []}
                    onSubmit={handleCreate}
                    isLoading={createMutation.isPending}
                    error={createMutation.error?.message}
                />
            </div>
        </div>
    );
}
