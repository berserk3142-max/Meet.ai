import { z } from "zod";

// Filter params schema for validation
export const agentsFilterSchema = z.object({
    search: z.string().optional().default(""),
    page: z.coerce.number().min(1).optional().default(1),
    pageSize: z.coerce.number().min(1).max(100).optional().default(10),
    status: z.enum(["all", "active", "inactive", "archived"]).optional().default("all"),
});

export type AgentsFilterParams = z.infer<typeof agentsFilterSchema>;

// Default filter values
export const DEFAULT_FILTERS: AgentsFilterParams = {
    search: "",
    page: 1,
    pageSize: 10,
    status: "all",
};
