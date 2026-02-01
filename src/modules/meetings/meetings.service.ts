import { db } from "@/db";
import { meeting, agent } from "@/schema";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import type { CreateMeetingInput, UpdateMeetingInput } from "./meetings.types";
import { nanoid } from "nanoid";

export interface GetManyParams {
    userId: string;
    agentId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}

export interface GetManyResult {
    meetings: (typeof meeting.$inferSelect & { agent: typeof agent.$inferSelect })[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Meetings Service - Database operations for meetings
 */
export const meetingsService = {
    /**
     * Get all meetings for a user
     */
    async getAllByUserId(userId: string) {
        const meetings = await db
            .select()
            .from(meeting)
            .where(eq(meeting.userId, userId))
            .orderBy(desc(meeting.createdAt));

        // Get agent info for each meeting
        const meetingsWithAgents = await Promise.all(
            meetings.map(async (m) => {
                const [agentData] = await db
                    .select()
                    .from(agent)
                    .where(eq(agent.id, m.agentId))
                    .limit(1);

                // Calculate duration in milliseconds
                let duration = null;
                if (m.startedAt && m.endedAt) {
                    duration = m.endedAt.getTime() - m.startedAt.getTime();
                }

                return {
                    ...m,
                    agent: agentData,
                    duration,
                };
            })
        );

        return meetingsWithAgents;
    },

    /**
     * Get meetings with filters and pagination
     */
    async getMany({ userId, search, page = 1, pageSize = 10, status, agentId }: GetManyParams & { search?: string }) {
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions = [eq(meeting.userId, userId)];

        if (search) {
            conditions.push(ilike(meeting.name, `%${search}%`));
        }

        if (status && status !== "all") {
            // Cast string status to enum type if needed, or just let dizzle handle it (it's text in db usually)
            conditions.push(eq(meeting.status, status as any));
        }

        if (agentId && agentId !== "all") {
            conditions.push(eq(meeting.agentId, agentId));
        }

        // Get total count
        const [countResult] = await db
            .select({ count: count() })
            .from(meeting)
            .where(and(...conditions));

        const total = countResult?.count || 0;

        // Get data
        const meetingsData = await db
            .select()
            .from(meeting)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset)
            .orderBy(desc(meeting.createdAt));

        // Join agents and calculate duration
        const meetings = await Promise.all(
            meetingsData.map(async (m) => {
                const [agentData] = await db
                    .select()
                    .from(agent)
                    .where(eq(agent.id, m.agentId))
                    .limit(1);

                let duration = null;
                if (m.startedAt && m.endedAt) {
                    duration = m.endedAt.getTime() - m.startedAt.getTime();
                }

                return { ...m, agent: agentData, duration };
            })
        );

        return {
            meetings,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    },

    /**
     * Get meetings by agent ID
     */
    async getByAgentId(agentId: string, userId: string) {
        return await db
            .select()
            .from(meeting)
            .where(and(eq(meeting.agentId, agentId), eq(meeting.userId, userId)))
            .orderBy(desc(meeting.createdAt));
    },

    /**
     * Get a single meeting by ID (with ownership check)
     */
    async getById(id: string, userId: string) {
        const [result] = await db
            .select()
            .from(meeting)
            .where(and(eq(meeting.id, id), eq(meeting.userId, userId)))
            .limit(1);

        if (!result) return null;

        // Get agent info
        const [agentData] = await db
            .select()
            .from(agent)
            .where(eq(agent.id, result.agentId))
            .limit(1);

        return { ...result, agent: agentData };
    },

    /**
     * Create a new meeting
     */
    async create(data: CreateMeetingInput, userId: string) {
        const now = new Date();
        const newMeeting = {
            id: nanoid(),
            ...data,
            userId,
            createdAt: now,
            updatedAt: now,
        };

        const [result] = await db.insert(meeting).values(newMeeting).returning();
        return result;
    },

    /**
     * Update a meeting (with ownership check)
     */
    async update(id: string, data: UpdateMeetingInput, userId: string) {
        const [result] = await db
            .update(meeting)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(and(eq(meeting.id, id), eq(meeting.userId, userId)))
            .returning();

        return result || null;
    },

    /**
     * Delete a meeting (with ownership check)
     */
    async delete(id: string, userId: string) {
        const [result] = await db
            .delete(meeting)
            .where(and(eq(meeting.id, id), eq(meeting.userId, userId)))
            .returning();

        return result || null;
    },

    /**
     * Get meeting count for an agent
     */
    async getCountByAgentId(agentId: string, userId: string) {
        const [result] = await db
            .select({ count: count() })
            .from(meeting)
            .where(and(eq(meeting.agentId, agentId), eq(meeting.userId, userId)));

        return result?.count || 0;
    },
};
