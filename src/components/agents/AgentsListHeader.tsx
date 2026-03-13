"use client";

import { Plus, Bot } from "lucide-react";

interface AgentsListHeaderProps {
    agentCount?: number;
    onNewAgent: () => void;
}

export function AgentsListHeader({ agentCount, onNewAgent }: AgentsListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8B5CF6] border-2 border-white flex items-center justify-center shadow-neo">
                    <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight uppercase">
                        My Agents
                    </h1>
                    <p className="text-gray-400 text-sm font-bold mt-2">
                        {agentCount !== undefined ? (
                            agentCount === 0 ? "No agents yet" : `${agentCount} agent${agentCount !== 1 ? 's' : ''} configured`
                        ) : "Loading..."}
                    </p>
                </div>
            </div>

            <button
                onClick={onNewAgent}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-[#8B5CF6] text-white font-black text-sm uppercase tracking-wider border-[3px] border-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all neo-btn"
            >
                <Plus className="w-5 h-5" />
                <span>New Agent</span>
            </button>
        </div>
    );
}
