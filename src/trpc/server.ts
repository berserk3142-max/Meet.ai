import "server-only";
import { createTRPCContext } from "./init";
import { createCaller } from "./routers/_app";
import { cache } from "react";

/**
 * Server-side tRPC caller
 * Use this in Server Components & Server Actions
 * 
 * Example:
 * const user = await api.users.getMe();
 */
const createContext = cache(async () => {
    return createTRPCContext();
});

export const api = async () => {
    const context = await createContext();
    return createCaller(context);
};
