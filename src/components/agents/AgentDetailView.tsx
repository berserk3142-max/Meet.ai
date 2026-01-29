"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { AgentDialog } from "./AgentDialog";
import { Bot, ChevronRight, Edit, Trash2, MoreHorizontal, Calendar, Clock, Hash } from "lucide-react";
import type { Agent, UpdateAgentInput } from "@/modules/agents";

interface AgentDetailViewProps {
    agent: Agent;
    onRefresh: () => void;
}

/**
 * AgentDetailView - Full agent detail page with edit/delete actions
 */
export function AgentDetailView({ agent, onRefresh }: AgentDetailViewProps) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    // Update mutation
    const updateMutation = trpc.agents.update.useMutation({
        onSuccess: () => {
            setIsEditDialogOpen(false);
            onRefresh();
        },
    });

    // Delete mutation
    const deleteMutation = trpc.agents.delete.useMutation({
        onSuccess: () => {
            router.push("/agents");
        },
    });

    const handleEdit = (data: UpdateAgentInput) => {
        updateMutation.mutate({
            id: agent.id,
            data,
        });
    };

    const handleDelete = () => {
        deleteMutation.mutate({ id: agent.id });
    };

    const statusColors = {
        active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        inactive: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    };

    const statusClass = statusColors[agent.status as keyof typeof statusColors] || statusColors.active;

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6">
                    <Link
                        href="/agents"
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        My Agents
                    </Link>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <span className="text-white font-medium">{agent.name}</span>
                </nav>

                {/* Agent Header Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                    <Bot className="w-8 h-8 text-emerald-400" />
                                </div>

                                {/* Name & Status */}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        {agent.name}
                                    </h1>
                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${statusClass}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                                </button>

                                {showActionsMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowActionsMenu(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                onClick={() => {
                                                    setIsEditDialogOpen(true);
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Agent
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsDeleteConfirmOpen(true);
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Agent
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 border-t border-zinc-800">
                        <div className="px-6 py-4 border-r border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                                <Calendar className="w-4 h-4" />
                                <span>Meetings</span>
                            </div>
                            <p className="text-xl font-semibold text-white">0</p>
                        </div>
                        <div className="px-6 py-4 border-r border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                                <Clock className="w-4 h-4" />
                                <span>Created</span>
                            </div>
                            <p className="text-sm text-white">{new Date(agent.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                                <Hash className="w-4 h-4" />
                                <span>ID</span>
                            </div>
                            <p className="text-sm text-white font-mono">{agent.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                </div>

                {/* Instructions Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Instructions</h2>
                    <div className="prose prose-invert max-w-none">
                        {agent.description ? (
                            <p className="text-zinc-300 whitespace-pre-wrap">{agent.description}</p>
                        ) : (
                            <p className="text-zinc-500 italic">No instructions provided for this agent.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Agent
                    </button>
                    <button
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Edit Dialog */}
            <AgentDialog
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    updateMutation.reset();
                }}
                mode="edit"
                agent={agent}
                onSubmit={handleEdit}
                isLoading={updateMutation.isPending}
                error={updateMutation.error?.message}
            />

            {/* Delete Confirmation Dialog */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                    />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Delete Agent</h2>
                        <p className="text-zinc-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-medium">&quot;{agent.name}&quot;</span>? This action cannot be undone.
                        </p>

                        {deleteMutation.error && (
                            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                                <p className="text-sm text-red-400">{deleteMutation.error.message}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete Agent</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
