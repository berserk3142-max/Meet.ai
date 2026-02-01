"use client";

import { MeetingForm } from "./MeetingForm";
import type { CreateMeetingInput, UpdateMeetingInput, Meeting } from "@/modules/meetings";
import type { Agent } from "@/modules/agents";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
 * MeetingDialog - Modal wrapper for MeetingForm using Shadcn Dialog
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
    const defaultValues = meeting ? {
        name: meeting.name,
        agentId: meeting.agentId,
        status: meeting.status,
    } : undefined;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-white p-0 gap-0">
                <DialogHeader className="p-6 pb-2 text-left">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {mode === "create" ? "New Meeting" : "Edit Meeting"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {mode === "create" ? "Start a new meeting session" : "Update meeting details"}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2">
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
            </DialogContent>
        </Dialog>
    );
}
