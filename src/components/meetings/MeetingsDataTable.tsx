"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { trpc } from "@/trpc/client";
import { Video, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

interface MeetingsDataTableProps {
    meetings: any[];
    agents: any[];
    onRefresh: () => void;
}

/**
 * MeetingsDataTable - Meetings displayed in a professional data table
 */
export function MeetingsDataTable({ meetings, agents, onRefresh }: MeetingsDataTableProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const deleteMutation = trpc.meetings.delete.useMutation({
        onSuccess: () => {
            onRefresh();
        },
    });

    const handleDelete = (meeting: any) => {
        if (confirm(`Are you sure you want to delete "${meeting.name}"?`)) {
            deleteMutation.mutate({ id: meeting.id });
        }
        setActiveMenu(null);
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            active: "bg-green-500/20 text-green-400 border-green-500/30",
            completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.upcoming}`}>
                {status}
            </span>
        );
    };

    // Find agent name helper
    const getAgentName = (meeting: any) => {
        if (meeting.agent?.name) return meeting.agent.name;
        const agent = agents.find((a: any) => a.id === meeting.agentId);
        return agent?.name || "Unknown Agent";
    };

    // Define columns
    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Meeting",
            sortable: true,
            render: (meeting) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <Video className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{meeting.name}</div>
                        <div className="text-xs text-zinc-500">ID: {meeting.id?.slice(0, 8)}...</div>
                    </div>
                </div>
            ),
        },
        {
            key: "agent",
            header: "Agent",
            render: (meeting) => (
                <span className="text-zinc-400">{getAgentName(meeting)}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (meeting) => <StatusBadge status={meeting.status} />,
        },
        {
            key: "createdAt",
            header: "Created",
            sortable: true,
            render: (meeting) => (
                <span className="text-zinc-400 text-sm">
                    {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : "-"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "w-12",
            render: (meeting) => (
                <div className="relative">
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
                                <Link
                                    href={`/meetings/${meeting.id}`}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    onClick={() => setActiveMenu(null)}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </Link>
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
            ),
        },
    ];

    return (
        <DataTable
            data={meetings}
            columns={columns}
            pageSize={10}
            getRowKey={(meeting) => meeting.id}
            emptyState={
                <div className="bg-black border-[3px] border-white p-12 text-center shadow-neo">
                    <Video className="w-12 h-12 text-[#8B5CF6] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white mb-2">No meetings yet</h3>
                    <p className="text-gray-500 font-medium">Create your first meeting to get started</p>
                </div>
            }
        />
    );
}
