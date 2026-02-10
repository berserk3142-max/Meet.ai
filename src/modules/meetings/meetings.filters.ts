import { z } from "zod";

// Filter params schema for validation
export const meetingsFilterSchema = z.object({
    search: z.string().optional().default(""),
    page: z.coerce.number().min(1).optional().default(1),
    pageSize: z.coerce.number().min(1).max(100).optional().default(10),
    status: z.enum(["all", "upcoming", "active", "completed", "processing", "cancelled"]).optional().default("all"),
    agentId: z.string().optional().default("all"),
});

export type MeetingsFilterParams = z.infer<typeof meetingsFilterSchema>;

// Default filter values
export const DEFAULT_MEETING_FILTERS: MeetingsFilterParams = {
    search: "",
    page: 1,
    pageSize: 10,
    status: "all",
    agentId: "all",
};
