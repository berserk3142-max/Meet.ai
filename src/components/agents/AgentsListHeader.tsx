"use client";

import { Plus, Bot } from "lucide-react";

interface AgentsListHeaderProps {
    agentCount?: number;
    onNewAgent: () => void;
}

/**
 * AgentsListHeader - Header with title, count, and New Agent button
 */
export function AgentsListHeader({ agentCount, onNewAgent }: AgentsListHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">My Agents</h1>
                    <p className="text-zinc-400 text-sm">
                        {agentCount !== undefined ? (
                            agentCount === 0
                                ? "No agents yet"
                                : `${agentCount} agent${agentCount !== 1 ? 's' : ''} configured`
                        ) : (
                            "Loading..."
                        )}
                    </p>
                </div>
            </div>

            <button
                onClick={onNewAgent}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
            >
                <Plus className="w-5 h-5" />
                <span>New Agent</span>
            </button>
        </div>
    );
}
