import { z } from "zod";
import { agent } from "@/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Infer types from Drizzle schema
export type Agent = InferSelectModel<typeof agent>;
export type NewAgent = InferInsertModel<typeof agent>;

// Agent status enum
export const AgentStatus = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ARCHIVED: "archived",
} as const;

export type AgentStatusType = (typeof AgentStatus)[keyof typeof AgentStatus];

// Zod validation schemas
export const createAgentSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const updateAgentSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(["active", "inactive", "archived"]).optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
