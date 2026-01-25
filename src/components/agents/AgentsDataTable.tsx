"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { AgentsEmptyState } from "@/components/ui/empty-state";
import { AgentDialog } from "./AgentDialog";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";
import { trpc } from "@/trpc/client";
import { Bot, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface AgentsDataTableProps {
    agents: Agent[];
    isLoading?: boolean;
    onRefresh: () => void;
}

/**
 * AgentsDataTable - Agents displayed in a professional data table
 */
export function AgentsDataTable({ agents, onRefresh }: AgentsDataTableProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Mutations
    const createMutation = trpc.agents.create.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            onRefresh();
        },
    });

    const updateMutation = trpc.agents.update.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            onRefresh();
        },
    });

    const deleteMutation = trpc.agents.delete.useMutation({
        onSuccess: () => {
            onRefresh();
        },
    });

    const openCreateDialog = () => {
        setDialogMode("create");
        setSelectedAgent(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (agent: Agent) => {
        setDialogMode("edit");
        setSelectedAgent(agent);
        setIsDialogOpen(true);
        setActiveMenu(null);
    };

    const handleDelete = (agent: Agent) => {
        if (confirm(`Are you sure you want to delete "${agent.name}"?`)) {
            deleteMutation.mutate({ id: agent.id });
        }
        setActiveMenu(null);
    };

    const handleSubmit = (data: CreateAgentInput | UpdateAgentInput) => {
        if (dialogMode === "create") {
            createMutation.mutate(data as CreateAgentInput);
        } else if (selectedAgent) {
            updateMutation.mutate({
                id: selectedAgent.id,
                data: data as UpdateAgentInput,
            });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedAgent(null);
        createMutation.reset();
        updateMutation.reset();
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: "bg-green-500/20 text-green-400 border-green-500/30",
            inactive: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.active}`}>
                {status}
            </span>
        );
    };

    // Define columns
    const columns: Column<Agent>[] = [
        {
            key: "name",
            header: "Agent",
            sortable: true,
            render: (agent) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-xs text-zinc-500">ID: {agent.id.slice(0, 8)}...</div>
                    </div>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (agent) => (
                <span className="text-zinc-400 line-clamp-2 max-w-xs">
                    {agent.description || "No description"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (agent) => <StatusBadge status={agent.status} />,
        },
        {
            key: "createdAt",
            header: "Created",
            sortable: true,
            render: (agent) => (
                <span className="text-zinc-400 text-sm">
                    {new Date(agent.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "w-12",
            render: (agent) => (
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === agent.id ? null : agent.id);
                        }}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </button>

                    {activeMenu === agent.id && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 py-1">
                                <Link
                                    href={`/agents/${agent.id}`}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                    onClick={() => setActiveMenu(null)}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </Link>
                                <button
                                    onClick={() => openEditDialog(agent)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(agent)}
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

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    return (
        <>
            <DataTable
                data={agents}
                columns={columns}
                pageSize={10}
                searchable={true}
                searchPlaceholder="Search agents..."
                searchKeys={["name", "description"] as (keyof Agent)[]}
                getRowKey={(agent) => agent.id}
                onRowClick={(agent) => {
                    // Navigate to agent details on row click (optional)
                }}
                emptyState={<AgentsEmptyState onCreateAgent={openCreateDialog} />}
            />

            <AgentDialog
                isOpen={isDialogOpen}
                onClose={closeDialog}
                mode={dialogMode}
                agent={selectedAgent}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                error={getMutationError()}
            />
        </>
    );
}
