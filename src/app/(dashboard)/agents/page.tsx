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
import { MoreHorizontal, Edit, Trash2, Eye, Video, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";

function AgentsPageContent() {
    const [search] = useQueryState("search", parseAsString.withDefault(""));
    const [status] = useQueryState("status", parseAsString.withDefault("all"));
    const [page] = useQueryState("page", parseAsInteger.withDefault(1));

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { data, isLoading, error, refetch } = trpc.agents.getMany.useQuery({
        search, status: status as any, page, pageSize: 10,
    });

    const createMutation = trpc.agents.create.useMutation({
        onSuccess: () => { setIsDialogOpen(false); setSelectedAgent(null); refetch(); },
    });
    const updateMutation = trpc.agents.update.useMutation({
        onSuccess: () => { setIsDialogOpen(false); setSelectedAgent(null); refetch(); },
    });
    const deleteMutation = trpc.agents.delete.useMutation({
        onSuccess: () => { refetch(); },
    });

    const openCreateDialog = () => { setDialogMode("create"); setSelectedAgent(null); setIsDialogOpen(true); };
    const openEditDialog = (agent: Agent) => { setDialogMode("edit"); setSelectedAgent(agent); setIsDialogOpen(true); setActiveMenu(null); };
    const handleDelete = (agent: Agent) => {
        if (confirm(`Are you sure you want to delete "${agent.name}"?`)) deleteMutation.mutate({ id: agent.id });
        setActiveMenu(null);
    };

    const handleSubmit = (formData: CreateAgentInput | UpdateAgentInput) => {
        if (dialogMode === "create") createMutation.mutate(formData as CreateAgentInput);
        else if (selectedAgent) updateMutation.mutate({ id: selectedAgent.id, data: formData as UpdateAgentInput });
    };

    const closeDialog = () => { setIsDialogOpen(false); setSelectedAgent(null); createMutation.reset(); updateMutation.reset(); };
    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            active: "bg-[#a3e635] text-black border-white",
            inactive: "bg-yellow-300 text-black border-white",
            archived: "bg-gray-500 text-white border-white",
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 text-[10px] uppercase font-black border-2 shadow-neo-sm ${styles[status] || styles.active}`}>
                {status}
            </span>
        );
    };

    const agentColors = ["#8B5CF6", "#a3e635", "#EAB308", "#EC4899", "#22d3ee", "#ef4444"];

    return (
        <div className="p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Upgrade Banner */}
                <div className="border-[3px] border-white bg-[#EAB308] text-black p-6 flex items-center justify-between shadow-neo-purple relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 border-8 border-black/10 rounded-full"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <Sparkles className="w-6 h-6" />
                        <div>
                            <h3 className="font-display font-bold text-lg uppercase">Unlock More Agents</h3>
                            <p className="text-sm font-medium">Upgrade to Pro for unlimited AI agent configurations.</p>
                        </div>
                    </div>
                    <Link
                        href="/upgrade"
                        className="bg-black text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors relative z-10 border-2 border-transparent hover:border-white"
                    >
                        Upgrade →
                    </Link>
                </div>

                <AgentsListHeader agentCount={data?.total} onNewAgent={openCreateDialog} />

                <AgentsFilters />

                {isLoading && <AgentsLoadingSkeleton />}
                {error && <AgentsError message={error.message} onRetry={() => refetch()} />}
                {!isLoading && !error && data?.agents.length === 0 && (
                    <AgentsEmptyState onCreateAgent={openCreateDialog} />
                )}

                {/* Agents table */}
                {!isLoading && !error && data && data.agents.length > 0 && (
                    <>
                        <div className="border-[3px] border-white bg-black shadow-neo-purple overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#111] border-b-[3px] border-white text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                            <th className="p-4 text-left">Agent</th>
                                            <th className="p-4 text-left">Description</th>
                                            <th className="p-4 text-left">Status</th>
                                            <th className="p-4 text-left">Meetings</th>
                                            <th className="p-4 text-left">Created</th>
                                            <th className="p-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.agents.map((agent, index) => (
                                            <tr key={agent.id} className="border-b-2 border-white/10 last:border-0 hover:bg-[#111] transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 border-2 border-white flex items-center justify-center shadow-neo-sm font-black text-white text-sm"
                                                            style={{ backgroundColor: agentColors[index % agentColors.length] }}
                                                        >
                                                            {agent.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{agent.name}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">ID: {agent.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-gray-400 line-clamp-2 max-w-xs text-sm font-medium">
                                                        {agent.description || "No description"}
                                                    </span>
                                                </td>
                                                <td className="p-4"><StatusBadge status={agent.status} /></td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black text-white bg-[#111] border-2 border-white shadow-neo-sm">
                                                        <Video className="w-3 h-3 text-[#8B5CF6]" />
                                                        {(agent as any).meetingCount ?? 0}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-gray-400 text-sm font-mono">
                                                        {new Date(agent.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === agent.id ? null : agent.id); }}
                                                            className="p-2 hover:bg-[#111] transition-colors border border-transparent hover:border-white"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                        </button>

                                                        {activeMenu === agent.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                                <div className="absolute right-0 top-full mt-1 w-44 bg-black border-2 border-white shadow-neo z-20 py-1">
                                                                    <Link
                                                                        href={`/agents/${agent.id}`}
                                                                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#8B5CF6] hover:text-white font-bold transition-colors"
                                                                        onClick={() => setActiveMenu(null)}
                                                                    >
                                                                        <Eye className="w-4 h-4" /> View Details
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => openEditDialog(agent)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#a3e635] hover:text-black font-bold transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4" /> Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(agent)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500 hover:text-white font-bold transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Delete
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

                        <AgentsPagination total={data.total} page={data.page} pageSize={data.pageSize} totalPages={data.totalPages} />
                    </>
                )}

                <AgentDialog
                    isOpen={isDialogOpen} onClose={closeDialog} mode={dialogMode}
                    agent={selectedAgent} onSubmit={handleSubmit}
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
