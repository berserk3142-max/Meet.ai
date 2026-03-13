"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { MeetingDialog } from "./MeetingDialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { MeetingsEmptyState } from "@/components/ui/empty-state";
import type { Meeting, CreateMeetingInput, UpdateMeetingInput } from "@/modules/meetings";
import type { Agent } from "@/modules/agents";
import { Video, MoreHorizontal, Edit, Trash2, Bot, Calendar, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MeetingsDataTableProps {
    meetings: (Meeting & { agent: Agent; duration?: number | null })[];
    agents: Agent[];
    onRefresh: () => void;
}

export function MeetingsDataTable({ meetings, agents, onRefresh }: MeetingsDataTableProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedMeeting, setSelectedMeeting] = useState<(Meeting & { agent: Agent }) | null>(null);

    const createMutation = trpc.meetings.create.useMutation({
        onSuccess: () => { setIsDialogOpen(false); setSelectedMeeting(null); onRefresh(); },
    });
    const updateMutation = trpc.meetings.update.useMutation({
        onSuccess: () => { setIsDialogOpen(false); setSelectedMeeting(null); onRefresh(); },
    });
    const deleteMutation = trpc.meetings.delete.useMutation({
        onSuccess: () => { onRefresh(); },
    });

    const openCreateDialog = () => { setDialogMode("create"); setSelectedMeeting(null); setIsDialogOpen(true); };
    const openEditDialog = (meeting: Meeting & { agent: Agent }) => { setDialogMode("edit"); setSelectedMeeting(meeting); setIsDialogOpen(true); };
    const handleDelete = (meeting: Meeting) => {
        if (confirm(`Are you sure you want to delete "${meeting.name}"?`)) deleteMutation.mutate({ id: meeting.id });
    };

    const handleSubmit = (data: CreateMeetingInput | UpdateMeetingInput) => {
        if (dialogMode === "create") createMutation.mutate(data as CreateMeetingInput);
        else if (selectedMeeting) updateMutation.mutate({ id: selectedMeeting.id, data: data as UpdateMeetingInput });
    };

    const closeDialog = () => { setIsDialogOpen(false); setSelectedMeeting(null); createMutation.reset(); updateMutation.reset(); };

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    const formatDuration = (ms: number | null | undefined) => {
        if (!ms) return "-";
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) return `${hours}hr ${remainingMinutes}m`;
        return `${minutes} mins`;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            upcoming: "bg-yellow-300 text-black border-white",
            active: "bg-[#8B5CF6] text-white border-white",
            completed: "bg-white/10 text-white border-white",
            processing: "bg-pink-500 text-white border-white",
            cancelled: "bg-gray-500 text-white border-white",
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 text-[10px] uppercase font-black border-2 shadow-neo-sm ${styles[status] || styles.upcoming}`}>
                {status}
            </span>
        );
    };

    const columns: Column<Meeting & { agent: Agent; duration?: number | null }>[] = [
        {
            key: "name",
            header: "Meeting",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8B5CF6]/20 flex items-center justify-center border-2 border-[#8B5CF6]/30">
                        <Video className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                        <div className="font-bold text-white">{meeting.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: {meeting.id.slice(0, 8)}...</div>
                    </div>
                </div>
            ),
        },
        {
            key: "agent",
            header: "Agent",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#a3e635]" />
                    <span className="text-gray-300 font-bold text-sm">{meeting.agent?.name || "Unknown"}</span>
                </div>
            ),
        },
        {
            key: "status", header: "Status", sortable: true,
            render: (meeting) => <StatusBadge status={meeting.status} />,
        },
        {
            key: "duration", header: "Duration", sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(meeting.duration)}</span>
                </div>
            ),
        },
        {
            key: "createdAt", header: "Created", sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            key: "actions", header: "", width: "w-[50px]",
            render: (meeting) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-[#111] transition-colors border border-transparent hover:border-white">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-black border-2 border-white text-gray-300 shadow-neo">
                            <DropdownMenuItem onClick={() => openEditDialog(meeting)} className="hover:bg-[#8B5CF6] hover:text-white cursor-pointer font-bold">
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(meeting)} className="text-red-400 hover:bg-red-500 hover:text-white cursor-pointer font-bold">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={meetings}
                searchable
                searchKeys={["name"]}
                searchPlaceholder="Search meetings..."
                emptyState={<MeetingsEmptyState onCreateMeeting={openCreateDialog} />}
                onRowClick={(meeting) => router.push(`/meetings/${meeting.id}`)}
                getRowKey={(meeting) => meeting.id}
            />
            <MeetingDialog
                isOpen={isDialogOpen}
                onClose={closeDialog}
                mode={dialogMode}
                meeting={selectedMeeting}
                agents={agents}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                error={getMutationError()}
            />
        </>
    );
}
