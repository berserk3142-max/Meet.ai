"use client";

import { use } from "react";
import { trpc } from "@/trpc/client";
import { AgentsLoadingSkeleton } from "@/components/agents/AgentsLoadingSkeleton";
import { AgentsError } from "@/components/agents/AgentsError";
import Link from "next/link";

interface AgentDetailPageProps {
    params: Promise<{ id: string }>;
}

const statusColors = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    inactive: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
    const { id } = use(params);
    const { data: agent, isLoading, error, refetch } = trpc.agents.getById.useQuery({ id });

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl">
                <AgentsLoadingSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl">
                <AgentsError message={error.message} onRetry={() => refetch()} />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="p-8 max-w-4xl">
                <AgentsError message="Agent not found" />
            </div>
        );
    }

    const statusClass = statusColors[agent.status as keyof typeof statusColors] || statusColors.active;

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                {/* Back link */}
                <Link
                    href="/agents"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Agents
                </Link>

                {/* Agent details card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusClass}`}>
                                {agent.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 mb-1">Description</h3>
                            <p className="text-zinc-300">
                                {agent.description || "No description provided"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 mb-1">Created</h3>
                                <p className="text-zinc-300">
                                    {new Date(agent.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 mb-1">Last Updated</h3>
                                <p className="text-zinc-300">
                                    {new Date(agent.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 mb-1">Agent ID</h3>
                            <p className="text-zinc-400 font-mono text-sm">{agent.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
