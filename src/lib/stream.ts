import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

// Server-side Stream client
export const streamServerClient = new StreamClient(apiKey, apiSecret);

/**
 * Generate a Stream Video token for a user
 * This must be called server-side only (tRPC procedure, API route)
 */
export function generateStreamToken(userId: string): string {
    // Token valid for 1 hour
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute buffer

    return streamServerClient.createToken(userId, expirationTime, issuedAt);
}

/**
 * Generate an avatar URL using UI Avatars service
 * Provides consistent fallback avatars based on user name
 */
export function generateAvatar(name: string): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&bold=true&size=128`;
}

/**
 * Generate a unique call ID for a meeting
 */
export function generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
