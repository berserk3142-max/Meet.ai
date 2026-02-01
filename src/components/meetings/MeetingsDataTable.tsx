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

/**
 * MeetingsDataTable - Display meetings using reusable DataTable
 */
export function MeetingsDataTable({ meetings, agents, onRefresh }: MeetingsDataTableProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedMeeting, setSelectedMeeting] = useState<(Meeting & { agent: Agent }) | null>(null);

    // Mutations
    const createMutation = trpc.meetings.create.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedMeeting(null);
            onRefresh();
        },
    });

    const updateMutation = trpc.meetings.update.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedMeeting(null);
            onRefresh();
        },
    });

    const deleteMutation = trpc.meetings.delete.useMutation({
        onSuccess: () => {
            onRefresh();
        },
    });

    const openCreateDialog = () => {
        setDialogMode("create");
        setSelectedMeeting(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (meeting: Meeting & { agent: Agent }) => {
        setDialogMode("edit");
        setSelectedMeeting(meeting);
        setIsDialogOpen(true);
    };

    const handleDelete = (meeting: Meeting) => {
        if (confirm(`Are you sure you want to delete "${meeting.name}"?`)) {
            deleteMutation.mutate({ id: meeting.id });
        }
    };

    const handleSubmit = (data: CreateMeetingInput | UpdateMeetingInput) => {
        if (dialogMode === "create") {
            createMutation.mutate(data as CreateMeetingInput);
        } else if (selectedMeeting) {
            updateMutation.mutate({
                id: selectedMeeting.id,
                data: data as UpdateMeetingInput,
            });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedMeeting(null);
        createMutation.reset();
        updateMutation.reset();
    };

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    // Helper to format duration
    const formatDuration = (ms: number | null | undefined) => {
        if (!ms) return "-";
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}hr ${remainingMinutes}m`;
        }
        return `${minutes} mins`;
    };

    // Helper for Status Badge
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            completed: "bg-green-500/20 text-green-400 border-green-500/30",
            processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.upcoming}`}>
                {status}
            </span>
        );
    };

    // Columns config
    const columns: Column<Meeting & { agent: Agent; duration?: number | null }>[] = [
        {
            key: "name",
            header: "Meeting",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                        <Video className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{meeting.name}</div>
                        <div className="text-xs text-zinc-500">ID: {meeting.id.slice(0, 8)}...</div>
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
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300">{meeting.agent?.name || "Unknown"}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (meeting) => <StatusBadge status={meeting.status} />,
        },
        {
            key: "duration",
            header: "Duration",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm">{formatDuration(meeting.duration)}</span>
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Created",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "w-[50px]",
            render: (meeting) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300">
                            <DropdownMenuItem
                                onClick={() => openEditDialog(meeting)}
                                className="hover:bg-zinc-800 hover:text-white cursor-pointer"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(meeting)}
                                className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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
