import { router, protectedProcedure } from "../init";
import { db } from "@/db";
import { meeting, agent } from "@/schema";
import { eq, and, count, sql } from "drizzle-orm";

export const dashboardRouter = router({
    /**
     * Get all dashboard metrics in a single call
     * Returns: totalMeetings, upcomingMeetings, completedMeetings, activeAgents, totalAgents, minutesSaved
     */
    getOverview: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        // Run all queries in parallel for speed
        const [
            totalMeetingsResult,
            upcomingMeetingsResult,
            completedMeetingsResult,
            activeMeetingsResult,
            totalAgentsResult,
            activeAgentsResult,
            minutesSavedResult,
        ] = await Promise.all([
            // Total meetings
            db.select({ count: count() })
                .from(meeting)
                .where(eq(meeting.userId, userId)),

            // Upcoming meetings
            db.select({ count: count() })
                .from(meeting)
                .where(and(eq(meeting.userId, userId), eq(meeting.status, "upcoming"))),

            // Completed meetings
            db.select({ count: count() })
                .from(meeting)
                .where(and(eq(meeting.userId, userId), eq(meeting.status, "completed"))),

            // Active (in-progress) meetings
            db.select({ count: count() })
                .from(meeting)
                .where(and(eq(meeting.userId, userId), eq(meeting.status, "active"))),

            // Total agents
            db.select({ count: count() })
                .from(agent)
                .where(eq(agent.userId, userId)),

            // Active agents
            db.select({ count: count() })
                .from(agent)
                .where(and(eq(agent.userId, userId), eq(agent.status, "active"))),

            // Total minutes saved (sum of meeting durations)
            db.select({
                totalMs: sql<number>`COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt")) * 1000), 0)`,
            })
                .from(meeting)
                .where(and(
                    eq(meeting.userId, userId),
                    eq(meeting.status, "completed"),
                )),
        ]);

        const totalMinutesSaved = Math.round((Number(minutesSavedResult[0]?.totalMs) || 0) / 60000);
        // AI saves roughly 3x the meeting time (summarization, notes, action items)
        const hoursSaved = Math.round((totalMinutesSaved * 3) / 60);

        return {
            totalMeetings: totalMeetingsResult[0]?.count || 0,
            upcomingMeetings: upcomingMeetingsResult[0]?.count || 0,
            completedMeetings: completedMeetingsResult[0]?.count || 0,
            activeMeetings: activeMeetingsResult[0]?.count || 0,
            totalAgents: totalAgentsResult[0]?.count || 0,
            activeAgents: activeAgentsResult[0]?.count || 0,
            hoursSaved,
        };
    }),
});
