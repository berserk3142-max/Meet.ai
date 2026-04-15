"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import type { CreateMeetingInput, UpdateMeetingInput } from "@/modules/meetings";

interface MeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    agents: any[];
    onSubmit: (data: CreateMeetingInput | UpdateMeetingInput) => void;
    isLoading?: boolean;
    error?: string;
}

/**
 * MeetingDialog - Responsive dialog for creating meetings
 * Uses ResponsiveDialog (modal on desktop, drawer on mobile)
 */
export function MeetingDialog({
    isOpen,
    onClose,
    mode,
    agents,
    onSubmit,
    isLoading,
    error,
}: MeetingDialogProps) {
    const [name, setName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!name.trim()) {
            setValidationError("Meeting name is required");
            return;
        }

        if (!agentId) {
            setValidationError("Please select an agent");
            return;
        }

        onSubmit({ name: name.trim(), agentId });
    };

    const handleClose = () => {
        setName("");
        setAgentId("");
        setValidationError(null);
        onClose();
    };

    const title = mode === "create" ? "Create New Meeting" : "Edit Meeting";
    const description = mode === "create"
        ? "Set up a new AI-powered meeting"
        : "Update meeting details";

    const displayError = validationError || error;

    return (
        <ResponsiveDialog
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            description={description}
        >
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
                        placeholder="e.g., Weekly Standup, Client Demo"
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        autoFocus
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        {name.length}/100 characters
                    </p>
                </div>

                {/* Agent selector */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Agent <span className="text-red-400">*</span>
                    </label>
                    <select
                        value={agentId}
                        onChange={(e) => {
                            setAgentId(e.target.value);
                            setValidationError(null);
                        }}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                        <option value="">Select an agent...</option>
                        {agents.map((agent: any) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !name.trim() || !agentId}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>{mode === "create" ? "Create Meeting" : "Save Changes"}</span>
                        )}
                    </button>
                </div>
            </form>
        </ResponsiveDialog>
    );
}
