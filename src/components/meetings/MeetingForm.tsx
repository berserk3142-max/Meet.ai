"use client";

import { useState, useEffect } from "react";
import type { CreateMeetingInput, UpdateMeetingInput } from "@/modules/meetings";
import { AgentCommandSelect } from "./AgentCommandSelect";
import type { Agent } from "@/modules/agents";

interface MeetingFormProps {
    mode: "create" | "edit";
    agents: Agent[];
    defaultValues?: {
        name?: string;
        agentId?: string;
        status?: string;
    };
    onSubmit: (data: CreateMeetingInput | UpdateMeetingInput) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * MeetingForm - Reusable form for creating and editing meetings
 */
export function MeetingForm({
    mode,
    agents,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
    error
}: MeetingFormProps) {
    const [name, setName] = useState(defaultValues?.name || "");
    const [agentId, setAgentId] = useState(defaultValues?.agentId || "");
    const [status, setStatus] = useState<"upcoming" | "active" | "completed" | "processing" | "cancelled">(
        (defaultValues?.status as "upcoming" | "active" | "completed" | "processing" | "cancelled") || "upcoming"
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset form when defaultValues change (for edit mode)
    useEffect(() => {
        if (defaultValues) {
            setName(defaultValues.name || "");
            setAgentId(defaultValues.agentId || "");
            setStatus((defaultValues.status as "upcoming" | "active" | "completed" | "processing" | "cancelled") || "upcoming");
        }
    }, [defaultValues]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validation
        if (!name.trim()) {
            setValidationError("Meeting name is required");
            return;
        }

        if (name.trim().length < 2) {
            setValidationError("Name must be at least 2 characters");
            return;
        }

        if (!agentId) {
            setValidationError("Please select an agent");
            return;
        }

        const data = {
            name: name.trim(),
            agentId,
            status,
        };

        onSubmit(data);
    };

    const handleReset = () => {
        setName(defaultValues?.name || "");
        setAgentId(defaultValues?.agentId || "");
        setStatus((defaultValues?.status as "upcoming" | "active" | "completed" | "processing" | "cancelled") || "upcoming");
        setValidationError(null);
        onCancel();
    };

    const displayError = validationError || error;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error display */}
            {displayError && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-400">{displayError}</p>
                </div>
            )}

            {/* Name field */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Meeting Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setValidationError(null);
                    }}
                    placeholder="e.g., Weekly Standup, Client Review"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    autoFocus
                />
                <p className="mt-1 text-xs text-zinc-500">
                    {name.length}/100 characters
                </p>
            </div>

            <label className="block text-sm font-medium text-zinc-300 mb-2">
                Agent <span className="text-red-400">*</span>
            </label>
            <AgentCommandSelect value={agentId} onChange={setAgentId} />
            {agentId === "" && validationError?.includes("agent") && (
                <p className="mt-1 text-xs text-red-500">{validationError}</p>
            )}

            {/* Status field (only in edit mode) */}
            {mode === "edit" && (
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Status
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {(["upcoming", "active", "completed", "cancelled"] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${status === s
                                    ? s === "completed"
                                        ? "bg-green-600/20 border-green-500 text-green-400"
                                        : s === "active"
                                            ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                            : s === "cancelled"
                                                ? "bg-red-600/20 border-red-500 text-red-400"
                                                : "bg-yellow-600/20 border-yellow-500 text-yellow-400"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !name.trim() || !agentId}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>{mode === "create" ? "Creating..." : "Saving..."}</span>
                        </>
                    ) : (
                        <span>{mode === "create" ? "Create Meeting" : "Save Changes"}</span>
                    )}
                </button>
            </div>
        </form>
    );
}
