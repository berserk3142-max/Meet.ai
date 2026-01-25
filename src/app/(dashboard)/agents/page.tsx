"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { AgentsListHeader } from "@/components/agents/AgentsListHeader";
import { AgentsDataTable } from "@/components/agents/AgentsDataTable";
import { AgentsList } from "@/components/agents/AgentsList";
import { AgentsLoadingSkeleton } from "@/components/agents/AgentsLoadingSkeleton";
import { AgentsError } from "@/components/agents/AgentsError";
import { LayoutGrid, Table } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "cards";

export default function AgentsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const { data: agents, isLoading, error, refetch } = trpc.agents.getAll.useQuery();

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with view toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <AgentsListHeader
                        agentCount={agents?.length}
                        onNewAgent={() => {
                            // Trigger create dialog - handled by child components
                            const event = new CustomEvent("openCreateAgent");
                            window.dispatchEvent(event);
                        }}
                    />

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                viewMode === "table"
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Table className="w-4 h-4" />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode("cards")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                viewMode === "cards"
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {isLoading && <AgentsLoadingSkeleton />}

                {/* Error state */}
                {error && <AgentsError message={error.message} onRetry={() => refetch()} />}

                {/* Content based on view mode */}
                {!isLoading && !error && (
                    viewMode === "table" ? (
                        <AgentsDataTable
                            agents={agents || []}
                            onRefresh={refetch}
                        />
                    ) : (
                        <AgentsList />
                    )
                )}
            </div>
        </div>
    );
}
