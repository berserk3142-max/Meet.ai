"use client";

import { MeetingForm } from "./MeetingForm";
import type { CreateMeetingInput, UpdateMeetingInput, Meeting } from "@/modules/meetings";
import type { Agent } from "@/modules/agents";
import { Video, X } from "lucide-react";

interface MeetingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    meeting?: Meeting | null;
    agents: Agent[];
    onSubmit: (data: CreateMeetingInput | UpdateMeetingInput) => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * MeetingDialog - Modal wrapper for MeetingForm
 */
export function MeetingDialog({
    isOpen,
    onClose,
    mode,
    meeting,
    agents,
    onSubmit,
    isLoading,
    error
}: MeetingDialogProps) {
    if (!isOpen) return null;

    const defaultValues = meeting ? {
        name: meeting.name,
        agentId: meeting.agentId,
        status: meeting.status,
    } : undefined;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                            <Video className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {mode === "create" ? "New Meeting" : "Edit Meeting"}
                            </h2>
                            <p className="text-sm text-zinc-400">
                                {mode === "create" ? "Start a new meeting session" : "Update meeting details"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <MeetingForm
                        mode={mode}
                        agents={agents}
                        defaultValues={defaultValues}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}
