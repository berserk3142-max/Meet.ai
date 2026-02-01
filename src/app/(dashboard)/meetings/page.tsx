"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { trpc } from "@/trpc/client";
import { MeetingsDataTable, MeetingDialog, MeetingsHeader, MeetingsFilters, MeetingsPagination } from "@/components/meetings";
import { Loader2 } from "lucide-react";
import type { CreateMeetingInput } from "@/modules/meetings";

export default function MeetingsPage() {
    // URL state
    const [search] = useQueryState("search", parseAsString.withDefault(""));
    const [status] = useQueryState("status", parseAsString.withDefault("all"));
    const [agentId] = useQueryState("agentId", parseAsString.withDefault("all"));
    const [page] = useQueryState("page", parseAsInteger.withDefault(1));

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Fetch meetings with filters
    const {
        data: meetingsData,
        isLoading: meetingsLoading,
        refetch: refetchMeetings
    } = trpc.meetings.getMany.useQuery({
        search,
        status: status as any,
        agentId,
        page,
        pageSize: 10,
    });

    // Fetch agents for the meeting form (and filters implicitly)
    const { data: agents, isLoading: agentsLoading } = trpc.agents.getAll.useQuery();

    // Create mutation
    const createMutation = trpc.meetings.create.useMutation({
        onSuccess: () => {
            setIsCreateDialogOpen(false);
            refetchMeetings();
        },
    });

    const handleCreate = (data: CreateMeetingInput | import("@/modules/meetings").UpdateMeetingInput) => {
        createMutation.mutate(data as CreateMeetingInput);
    };

    const isLoading = meetingsLoading && !meetingsData;

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <MeetingsHeader onNew={() => setIsCreateDialogOpen(true)} />

                    {/* Stats Overview (simplified for now) */}
                    {meetingsData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                <div className="text-sm text-zinc-400 mb-1">Total Found</div>
                                <div className="text-2xl font-bold text-white">{meetingsData.total}</div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <MeetingsFilters />

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
                            <p className="text-zinc-400">Loading meetings...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Meetings Table */}
                            <MeetingsDataTable
                                meetings={meetingsData?.meetings || []}
                                agents={agents || []}
                                onRefresh={refetchMeetings}
                            />

                            {/* Pagination */}
                            {meetingsData && (
                                <MeetingsPagination
                                    total={meetingsData.total}
                                    page={meetingsData.page}
                                    pageSize={meetingsData.pageSize}
                                    totalPages={meetingsData.totalPages}
                                />
                            )}
                        </div>
                    )}

                    {/* No Agents Warning */}
                    {!agentsLoading && agents && agents.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ You need to create at least one agent before you can create meetings.
                                <a href="/agents" className="underline ml-1 hover:text-yellow-300">Go to Agents →</a>
                            </p>
                        </div>
                    )}
                </div>

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
