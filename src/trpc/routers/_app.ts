import { router, createCallerFactory } from "../init";
import { usersRouter } from "./users";
import { agentsRouter } from "./agents";

/**
 * App Router - All tRPC routers merged here
 */
export const appRouter = router({
    users: usersRouter,
    agents: agentsRouter,
});

// Export type for client usage
export type AppRouter = typeof appRouter;

// Create caller factory for server-side usage
export const createCaller = createCallerFactory(appRouter);
