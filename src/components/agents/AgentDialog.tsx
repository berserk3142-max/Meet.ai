"use client";

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { AgentForm } from "./AgentForm";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/modules/agents";

interface AgentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    agent?: Agent | null;
    onSubmit: (data: CreateAgentInput | UpdateAgentInput) => void;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * AgentDialog - Responsive dialog for creating/editing agents
 * Uses ResponsiveDialog (modal on desktop, drawer on mobile)
 */
export function AgentDialog({
    isOpen,
    onClose,
    mode,
    agent,
    onSubmit,
    isLoading,
    error,
}: AgentDialogProps) {
    const title = mode === "create" ? "Create New Agent" : "Edit Agent";
    const description = mode === "create"
        ? "Set up a new AI agent to automate your meetings"
        : `Editing "${agent?.name}"`;

    return (
        <ResponsiveDialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
        >
            <AgentForm
                mode={mode}
                defaultValues={agent || undefined}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
                error={error}
            />
        </ResponsiveDialog>
    );
}
