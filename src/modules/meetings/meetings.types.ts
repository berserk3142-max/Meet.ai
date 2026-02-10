import { z } from "zod";
import { meeting } from "@/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Infer types from Drizzle schema
export type Meeting = InferSelectModel<typeof meeting>;
export type NewMeeting = InferInsertModel<typeof meeting>;

// Meeting status enum
export const MeetingStatus = {
    UPCOMING: "upcoming",
    ACTIVE: "active",
    COMPLETED: "completed",
    PROCESSING: "processing",
    CANCELLED: "cancelled",
} as const;

export type MeetingStatusType = (typeof MeetingStatus)[keyof typeof MeetingStatus];

// Zod validation schemas
export const createMeetingSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    agentId: z.string().min(1, "Agent is required"),
    status: z.enum(["upcoming", "active", "completed", "processing", "cancelled"]).default("upcoming"),
    startedAt: z.date().optional(),
    endedAt: z.date().optional(),
});

export const updateMeetingSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    agentId: z.string().min(1).optional(),
    status: z.enum(["upcoming", "active", "completed", "processing", "cancelled"]).optional(),
    startedAt: z.date().optional().nullable(),
    endedAt: z.date().optional().nullable(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
