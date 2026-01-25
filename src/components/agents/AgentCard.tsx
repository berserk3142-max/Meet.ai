"use client";

import type { Agent } from "@/modules/agents";

interface AgentCardProps {
    agent: Agent;
    onEdit?: (agent: Agent) => void;
    onDelete?: (agent: Agent) => void;
}

const statusColors = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    inactive: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
    const statusClass = statusColors[agent.status as keyof typeof statusColors] || statusColors.active;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white truncate">{agent.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClass}`}>
                    {agent.status}
                </span>
            </div>

            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                {agent.description || "No description provided"}
            </p>

            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                    Created {new Date(agent.createdAt).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit?.(agent)}
                        className="px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(agent)}
                        className="px-3 py-1.5 text-xs bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
