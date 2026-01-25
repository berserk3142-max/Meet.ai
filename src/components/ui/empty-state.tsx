"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * EmptyState - Displays when no data is available
 * Professional SaaS empty state with illustration, message, and CTA
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center",
            className
        )}>
            {/* Illustration/Icon */}
            {icon ? (
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    {icon}
                </div>
            ) : (
                <div className="w-20 h-20 mx-auto mb-6 relative">
                    {/* Default illustration - Abstract AI agent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30" />
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl border border-purple-500/20" />
                    <div className="absolute inset-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300" />
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-2">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                    {description}
                </p>
            )}

            {/* Action button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {action.label}
                </button>
            )}
        </div>
    );
}

// Pre-built empty state variants
export function AgentsEmptyState({ onCreateAgent }: { onCreateAgent: () => void }) {
    return (
        <EmptyState
            title="Create your first agent"
            description="AI agents help automate your meetings, take notes, and provide insights. Get started by creating your first agent."
            action={{
                label: "Create Agent",
                onClick: onCreateAgent,
            }}
        />
    );
}

export function SearchEmptyState({ searchQuery }: { searchQuery: string }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-1">No results found</h3>
            <p className="text-zinc-500 text-sm">
                No agents match &quot;{searchQuery}&quot;
            </p>
        </div>
    );
}
