/**
 * Auth utilities - Powered by Clerk
 *
 * Use these imports from @clerk/nextjs/server directly:
 *   - auth() - Get the current user's auth state (server-side)
 *   - currentUser() - Get the full current user object (server-side)
 *
 * Use these imports from @clerk/nextjs (client-side):
 *   - useUser() - Get the current user
 *   - useAuth() - Get auth state
 *   - SignIn, SignUp, UserButton, UserProfile - UI components
 */

export { auth, currentUser } from "@clerk/nextjs/server";
