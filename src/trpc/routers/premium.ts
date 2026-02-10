import { router, premiumProcedure } from "../init";

/**
 * Premium Router — features only available to Pro subscribers
 */
export const premiumRouter = router({
    /**
     * Get premium usage stats
     */
    getUsageStats: premiumProcedure.query(async ({ ctx }) => {
        // Premium-only analytics
        return {
            plan: "pro",
            userId: ctx.user.id,
            features: {
                unlimitedMeetings: true,
                advancedSummaries: true,
                transcriptChat: true,
                prioritySupport: true,
            },
        };
    }),
});
