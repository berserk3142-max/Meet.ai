import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { generateStreamToken, generateAvatar } from "@/lib/stream";

export const streamRouter = router({
    /**
     * Generate a Stream Video token for the current user
     * This is called by the client before joining a call
     */
    generateToken: protectedProcedure.query(async ({ ctx }) => {
        const token = generateStreamToken(ctx.user.id);
        const avatar = generateAvatar(ctx.user.name || ctx.user.email || "User");

        return {
            token,
            userId: ctx.user.id,
            userName: ctx.user.name || ctx.user.email || "User",
            userImage: ctx.user.image || avatar,
        };
    }),
});
