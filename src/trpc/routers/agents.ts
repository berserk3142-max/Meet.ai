import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { agentsService, createAgentSchema, updateAgentSchema, agentsFilterSchema } from "@/modules/agents";
import { meetingsService } from "@/modules/meetings";
import { TRPCError } from "@trpc/server";

export const agentsRouter = router({
    /**
     * Get all agents for the current user
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const agents = await agentsService.getAllByUserId(ctx.user.id);
        return agents;
    }),

    /**
     * Get agents with pagination, search, and per-agent meeting counts
     */
    getMany: protectedProcedure
        .input(agentsFilterSchema)
        .query(async ({ ctx, input }) => {
            const result = await agentsService.getMany({
                userId: ctx.user.id,
                search: input.search,
                page: input.page,
                pageSize: input.pageSize,
                status: input.status,
            });

            // Add per-agent meeting counts in parallel
            const agentsWithCounts = await Promise.all(
                result.agents.map(async (agentItem) => {
                    const meetingCount = await meetingsService.getCountByAgentId(
                        agentItem.id,
                        ctx.user.id
                    );
                    return { ...agentItem, meetingCount };
                })
            );

            return {
                ...result,
                agents: agentsWithCounts,
            };
        }),

    /**
     * Get a single agent by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const agent = await agentsService.getById(input.id, ctx.user.id);

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found",
                });
            }

            return agent;
        }),

    /**
     * Create a new agent
     */
    create: protectedProcedure
        .input(createAgentSchema)
        .mutation(async ({ ctx, input }) => {
            const agent = await agentsService.create(input, ctx.user.id);
            return agent;
        }),

    /**
     * Update an agent
     */
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: updateAgentSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const agent = await agentsService.update(input.id, input.data, ctx.user.id);

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found or you don't have permission",
                });
            }

            return agent;
        }),

    /**
     * Delete an agent
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const agent = await agentsService.delete(input.id, ctx.user.id);

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found or you don't have permission",
                });
            }

            return { success: true, deletedAgent: agent };
        }),
});
