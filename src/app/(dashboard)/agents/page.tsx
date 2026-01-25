"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/trpc/client";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { AgentsListHeader } from "@/components/agents/AgentsListHeader";
import { AgentsFilters, AgentsPagination } from "@/components/agents/AgentsFilters";
import { AgentsLoadingSkeleton } from "@/components/agents/AgentsLoadingSkeleton";
import { AgentsError } from "@/components/agents/AgentsError";
import { AgentDialog } from "@/components/agents/AgentDialog";
import { AgentsEmptyState } from "@/components/ui/empty-state";
import { Bot, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";

function AgentsPageContent() {
    // URL state with NUQS
    const [search] = useQueryState("search", parseAsString.withDefault(""));
    const [status] = useQueryState("status", parseAsString.withDefault("all"));
    const [page] = useQueryState("page", parseAsInteger.withDefault(1));

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Fetch agents with filters
    const { data, isLoading, error, refetch } = trpc.agents.getMany.useQuery({
        search,
        status,
        page,
        pageSize: 10,
    });

    // Mutations
    const createMutation = trpc.agents.create.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            refetch();
        },
    });

    const updateMutation = trpc.agents.update.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            refetch();
        },
    });

    const deleteMutation = trpc.agents.delete.useMutation({
        onSuccess: () => {
            refetch();
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

    const handleSubmit = (formData: CreateAgentInput | UpdateAgentInput) => {
        if (dialogMode === "create") {
            createMutation.mutate(formData as CreateAgentInput);
        } else if (selectedAgent) {
            updateMutation.mutate({
                id: selectedAgent.id,
                data: formData as UpdateAgentInput,
            });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedAgent(null);
        createMutation.reset();
        updateMutation.reset();
    };

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    // Status badge
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

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <AgentsListHeader
                    agentCount={data?.total}
                    onNewAgent={openCreateDialog}
                />

                {/* Filters */}
                <div className="mb-6">
                    <AgentsFilters />
                </div>

                {/* Loading state */}
                {isLoading && <AgentsLoadingSkeleton />}

                {/* Error state */}
                {error && <AgentsError message={error.message} onRetry={() => refetch()} />}

                {/* Empty state */}
                {!isLoading && !error && data?.agents.length === 0 && (
                    <AgentsEmptyState onCreateAgent={openCreateDialog} />
                )}

                {/* Agents table */}
                {!isLoading && !error && data && data.agents.length > 0 && (
                    <>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Agent</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Description</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Created</th>
                                            <th className="px-4 py-3 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.agents.map((agent) => (
                                            <tr key={agent.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                                            <Bot className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{agent.name}</div>
                                                            <div className="text-xs text-zinc-500">ID: {agent.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-zinc-400 line-clamp-2 max-w-xs text-sm">
                                                        {agent.description || "No description"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={agent.status} />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-zinc-400 text-sm">
                                                        {new Date(agent.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
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
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <AgentsPagination
                            total={data.total}
                            page={data.page}
                            pageSize={data.pageSize}
                            totalPages={data.totalPages}
                        />
                    </>
                )}

                {/* Dialog */}
                <AgentDialog
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                    mode={dialogMode}
                    agent={selectedAgent}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    error={getMutationError()}
                />
            </div>
        </div>
    );
}

export default function AgentsPage() {
    return (
        <Suspense fallback={<div className="p-8"><AgentsLoadingSkeleton /></div>}>
            <AgentsPageContent />
        </Suspense>
    );
}
