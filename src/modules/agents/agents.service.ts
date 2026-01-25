import { db } from "@/db";
import { agent } from "@/schema";
import { eq, and, ilike, desc, sql, count } from "drizzle-orm";
import type { CreateAgentInput, UpdateAgentInput } from "./agents.types";
import { nanoid } from "nanoid";

export interface GetManyParams {
    userId: string;
    search?: string;
    page?: number;
    pageSize?: number;
    status?: string;
}

export interface GetManyResult {
    agents: (typeof agent.$inferSelect)[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

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
            .orderBy(desc(agent.createdAt));
    },

    /**
     * Get agents with pagination and search
     */
    async getMany(params: GetManyParams): Promise<GetManyResult> {
        const { userId, search, page = 1, pageSize = 10, status } = params;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions = [eq(agent.userId, userId)];

        if (search && search.trim()) {
            conditions.push(ilike(agent.name, `%${search.trim()}%`));
        }

        if (status && status !== "all") {
            conditions.push(eq(agent.status, status));
        }

        const whereClause = and(...conditions);

        // Get agents with pagination
        const agents = await db
            .select()
            .from(agent)
            .where(whereClause)
            .orderBy(desc(agent.createdAt))
            .limit(pageSize)
            .offset(offset);

        // Get total count
        const [countResult] = await db
            .select({ total: count() })
            .from(agent)
            .where(whereClause);

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / pageSize);

        return {
            agents,
            total,
            page,
            pageSize,
            totalPages,
        };
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
