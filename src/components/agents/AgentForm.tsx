"use client";

import { useState, useEffect } from "react";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";

interface AgentFormProps {
    mode: "create" | "edit";
    defaultValues?: Partial<Agent>;
    onSubmit: (data: CreateAgentInput | UpdateAgentInput) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * AgentForm - Reusable form for creating and editing agents
 */
export function AgentForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
    error
}: AgentFormProps) {
    const [name, setName] = useState(defaultValues?.name || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [status, setStatus] = useState<"active" | "inactive" | "archived">(
        (defaultValues?.status as "active" | "inactive" | "archived") || "active"
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset form when defaultValues change (for edit mode)
    useEffect(() => {
        if (defaultValues) {
            setName(defaultValues.name || "");
            setDescription(defaultValues.description || "");
            setStatus((defaultValues.status as "active" | "inactive" | "archived") || "active");
        }
    }, [defaultValues]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validation
        if (!name.trim()) {
            setValidationError("Agent name is required");
            return;
        }

        if (name.trim().length < 2) {
            setValidationError("Name must be at least 2 characters");
            return;
        }

        if (name.trim().length > 100) {
            setValidationError("Name must be less than 100 characters");
            return;
        }

        if (description && description.length > 500) {
            setValidationError("Description must be less than 500 characters");
            return;
        }

        const data = {
            name: name.trim(),
            description: description.trim() || undefined,
            status,
        };

        onSubmit(data);
    };

    const handleReset = () => {
        setName(defaultValues?.name || "");
        setDescription(defaultValues?.description || "");
        setStatus((defaultValues?.status as "active" | "inactive" | "archived") || "active");
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
                    Agent Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setValidationError(null);
                    }}
                    placeholder="e.g., Meeting Assistant, Sales Agent"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    autoFocus
                />
                <p className="mt-1 text-xs text-zinc-500">
                    {name.length}/100 characters
                </p>
            </div>

            {/* Description field */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this agent do? Add instructions for meetings..."
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
                <p className="mt-1 text-xs text-zinc-500">
                    {description.length}/500 characters
                </p>
            </div>

            {/* Status field */}
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                </label>
                <div className="flex gap-3">
                    {(["active", "inactive", "archived"] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${status === s
                                    ? s === "active"
                                        ? "bg-green-600/20 border-green-500 text-green-400"
                                        : s === "inactive"
                                            ? "bg-yellow-600/20 border-yellow-500 text-yellow-400"
                                            : "bg-zinc-600/20 border-zinc-500 text-zinc-400"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

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
                    disabled={isLoading || !name.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <span>{mode === "create" ? "Create Agent" : "Save Changes"}</span>
                    )}
                </button>
            </div>
        </form>
    );
}
