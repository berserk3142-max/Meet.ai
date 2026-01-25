"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { AgentCard } from "./AgentCard";
import { AgentsLoadingSkeleton } from "./AgentsLoadingSkeleton";
import { AgentsError } from "./AgentsError";
import { AgentsListHeader } from "./AgentsListHeader";
import { AgentDialog } from "./AgentDialog";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";

export function AgentsList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Agent | null>(null);

    // Fetch agents
    const { data: agents, isLoading, error, refetch } = trpc.agents.getAll.useQuery();

    // Create agent mutation
    const createMutation = trpc.agents.create.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            refetch();
        },
    });

    // Update agent mutation
    const updateMutation = trpc.agents.update.useMutation({
        onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedAgent(null);
            refetch();
        },
    });

    // Delete agent mutation
    const deleteMutation = trpc.agents.delete.useMutation({
        onSuccess: () => {
            setDeleteConfirm(null);
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
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedAgent(null);
        createMutation.reset();
        updateMutation.reset();
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

    const handleDelete = (agent: Agent) => {
        if (deleteConfirm?.id === agent.id) {
            deleteMutation.mutate({ id: agent.id });
        } else {
            setDeleteConfirm(agent);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <>
                <AgentsListHeader onNewAgent={openCreateDialog} />
                <AgentsLoadingSkeleton />
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <AgentsListHeader onNewAgent={openCreateDialog} />
                <AgentsError message={error.message} onRetry={() => refetch()} />
            </>
        );
    }

    const getMutationError = () => {
        if (createMutation.error) return createMutation.error.message;
        if (updateMutation.error) return updateMutation.error.message;
        return null;
    };

    // Empty state
    if (!agents || agents.length === 0) {
        return (
            <>
                <AgentsListHeader agentCount={0} onNewAgent={openCreateDialog} />

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No agents yet</h2>
                    <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                        Create your first AI agent to automate meetings and boost productivity.
                    </p>
                    <button
                        onClick={openCreateDialog}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        Create Your First Agent
                    </button>
                </div>

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

    // Agents list
    return (
        <>
            <AgentsListHeader agentCount={agents.length} onNewAgent={openCreateDialog} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        onEdit={openEditDialog}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Delete confirmation toast */}
            {deleteConfirm && (
                <div className="fixed bottom-4 right-4 bg-zinc-900 border border-red-800 rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom duration-200">
                    <p className="text-white mb-3">Delete &quot;{deleteConfirm.name}&quot;?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteMutation.mutate({ id: deleteConfirm.id })}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                        </button>
                    </div>
                </div>
            )}

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
