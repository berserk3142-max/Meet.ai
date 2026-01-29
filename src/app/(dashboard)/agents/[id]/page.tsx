"use client";

import { use } from "react";
import { trpc } from "@/trpc/client";
import { AgentDetailView } from "@/components/agents/AgentDetailView";
import { AgentsLoadingSkeleton } from "@/components/agents/AgentsLoadingSkeleton";
import { AgentsError } from "@/components/agents/AgentsError";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AgentDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
    const { id } = use(params);
    const { data: agent, isLoading, error, refetch } = trpc.agents.getById.useQuery({ id });

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-4 w-32 bg-zinc-800 rounded mb-6" />
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-zinc-800 rounded-xl" />
                                <div>
                                    <div className="h-8 w-48 bg-zinc-800 rounded mb-2" />
                                    <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                                </div>
                            </div>
                            <div className="h-20 bg-zinc-800 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/agents"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Agents
                    </Link>
                    <AgentsError message={error.message} onRetry={() => refetch()} />
                </div>
            </div>
        );
    }

    // Not found state
    if (!agent) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/agents"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Agents
                    </Link>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">Agent Not Found</h2>
                        <p className="text-zinc-400">The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success: render detail view
    return <AgentDetailView agent={agent} onRefresh={refetch} />;
}
