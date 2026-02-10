import { router, createCallerFactory } from "../init";
import { usersRouter } from "./users";
import { agentsRouter } from "./agents";
import { meetingsRouter } from "./meetings";
import { streamRouter } from "./stream";
import { premiumRouter } from "./premium";
import { dashboardRouter } from "./dashboard";

/**
 * App Router - All tRPC routers merged here
 */
export const appRouter = router({
    users: usersRouter,
    agents: agentsRouter,
    meetings: meetingsRouter,
    stream: streamRouter,
    premium: premiumRouter,
    dashboard: dashboardRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;

// Create caller factory for server-side usage
export const createCaller = createCallerFactory(appRouter);



