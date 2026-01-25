import { db } from "@/db";
import { agent } from "@/schema";
import { eq, and } from "drizzle-orm";
import type { CreateAgentInput, UpdateAgentInput } from "./agents.types";
import { nanoid } from "nanoid";

/**
 * Agents Service - Database operations for agents
 */
export const agentsService = {
    /**
     * Get all agents for a user
     */
    async getAllByUserId(userId: string) {
        return await db
            .select()
            .from(agent)
            .where(eq(agent.userId, userId))
            .orderBy(agent.createdAt);
    },

    /**
     * Get a single agent by ID (with ownership check)
     */
    async getById(id: string, userId: string) {
        const result = await db
            .select()
            .from(agent)
            .where(and(eq(agent.id, id), eq(agent.userId, userId)))
            .limit(1);

        return result[0] || null;
    },

    /**
     * Create a new agent
     */
    async create(data: CreateAgentInput, userId: string) {
        const now = new Date();
        const newAgent = {
            id: nanoid(),
            ...data,
            userId,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.insert(agent).values(newAgent).returning();
        return result[0];
    },

    /**
     * Update an agent (with ownership check)
     */
    async update(id: string, data: UpdateAgentInput, userId: string) {
        const result = await db
            .update(agent)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(and(eq(agent.id, id), eq(agent.userId, userId)))
            .returning();

        return result[0] || null;
    },

    /**
     * Delete an agent (with ownership check)
     */
    async delete(id: string, userId: string) {
        const result = await db
            .delete(agent)
            .where(and(eq(agent.id, id), eq(agent.userId, userId)))
            .returning();

        return result[0] || null;
    },
};
