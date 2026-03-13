"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { trpc } from "@/trpc/client";
import { MeetingsDataTable } from "@/components/meetings/MeetingsDataTable";
import { MeetingDialog } from "@/components/meetings/MeetingDialog";
import { MeetingsHeader } from "@/components/meetings/MeetingsHeader";
import { MeetingsFilters, MeetingsPagination } from "@/components/meetings/MeetingsFilters";
import { Loader2 } from "lucide-react";
import type { CreateMeetingInput } from "@/modules/meetings";
import Link from "next/link";

export default function MeetingsPage() {
    const [search] = useQueryState("search", parseAsString.withDefault(""));
    const [status] = useQueryState("status", parseAsString.withDefault("all"));
    const [agentId] = useQueryState("agentId", parseAsString.withDefault("all"));
    const [page] = useQueryState("page", parseAsInteger.withDefault(1));

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

    const { data: agents, isLoading: agentsLoading } = trpc.agents.getAll.useQuery();

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
        <div className="p-8 lg:p-12 relative">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <MeetingsHeader onNew={() => setIsCreateDialogOpen(true)} />

                {/* Stats */}
                {meetingsData && (
                    <div className="inline-block">
                        <div className="bg-black border-[3px] border-white p-6 shadow-neo-purple neo-card flex items-center gap-6">
                            <span className="material-icons text-3xl text-[#8B5CF6]">video_camera_front</span>
                            <div>
                                <div className="text-4xl font-black text-white">{meetingsData.total}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Meetings</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <MeetingsFilters />

                {/* Loading */}
                {isLoading ? (
                    <div className="bg-black border-[3px] border-white p-12 text-center shadow-neo">
                        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">Loading meetings...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <MeetingsDataTable
                            meetings={meetingsData?.meetings || []}
                            agents={agents || []}
                            onRefresh={refetchMeetings}
                        />

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
                    <div className="mt-4 p-4 bg-[#EAB308]/10 border-[3px] border-[#EAB308] shadow-neo-purple">
                        <p className="text-[#EAB308] text-sm font-bold">
                            ⚠️ You need to create at least one agent before you can create meetings.
                            <Link href="/agents" className="underline ml-1 hover:text-white transition-colors font-black">Go to Agents →</Link>
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
    );
}
