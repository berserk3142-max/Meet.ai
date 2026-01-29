"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { MeetingDialog } from "./MeetingDialog";
import type { Meeting, CreateMeetingInput, UpdateMeetingInput } from "@/modules/meetings";
import type { Agent } from "@/modules/agents";
import { Video, MoreHorizontal, Edit, Trash2, Bot, Calendar } from "lucide-react";

interface MeetingsDataTableProps {
    meetings: (Meeting & { agent: Agent })[];
    agents: Agent[];
    onRefresh: () => void;
}

/**
 * MeetingsDataTable - Display meetings in a professional table format
 */
export function MeetingsDataTable({ meetings, agents, onRefresh }: MeetingsDataTableProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedMeeting, setSelectedMeeting] = useState<(Meeting & { agent: Agent }) | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
        setActiveMenu(null);
    };

    const handleDelete = (meeting: Meeting) => {
        if (confirm(`Are you sure you want to delete "${meeting.name}"?`)) {
            deleteMutation.mutate({ id: meeting.id });
        }
        setActiveMenu(null);
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

    // Status badge component
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

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    if (meetings.length === 0) {
        return (
            <>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <Video className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No meetings yet</h2>
                    <p className="text-zinc-400 mb-6">Start your first meeting to see it here.</p>
                    <button
                        onClick={openCreateDialog}
                        disabled={agents.length === 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Meeting
                    </button>
                    {agents.length === 0 && (
                        <p className="mt-3 text-sm text-yellow-500">Create an agent first to start a meeting.</p>
                    )}
                </div>

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

    return (
        <>
            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Meeting</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Agent</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Created</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {meetings.map((meeting) => (
                            <tr
                                key={meeting.id}
                                className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/meetings/${meeting.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                                            <Video className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{meeting.name}</div>
                                            <div className="text-xs text-zinc-500">ID: {meeting.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-4 h-4 text-blue-400" />
                                        <span className="text-zinc-300">{meeting.agent?.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={meeting.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(meeting.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === meeting.id ? null : meeting.id);
                                            }}
                                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                                        </button>

                                        {activeMenu === meeting.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveMenu(null)}
                                                />
                                                <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 py-1">
                                                    <button
                                                        onClick={() => openEditDialog(meeting)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(meeting)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
