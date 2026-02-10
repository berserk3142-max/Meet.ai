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

/**
 * Create or update an AI agent user in Stream
 */
export async function createAgentUser(agentId: string, agentName: string) {
    try {
        await streamServerClient.upsertUsers([
            {
                id: `agent_${agentId}`,
                name: agentName,
                role: "user",
                custom: {
                    isAI: true,
                    agentId,
                },
                image: generateAvatar(agentName),
            },
        ]);
        return `agent_${agentId}`;
    } catch (error) {
        console.error("[Stream] Failed to create agent user:", error);
        throw error;
    }
}

/**
 * Add AI agent to a call as a participant
 */
export async function addAgentToCall(callId: string, agentId: string, agentName: string) {
    try {
        // First, create/update the agent user
        const agentUserId = await createAgentUser(agentId, agentName);

        // Get the call
        const call = streamServerClient.video.call("default", callId);

        // Update call members to include the AI agent
        await call.updateCallMembers({
            update_members: [
                {
                    user_id: agentUserId,
                    role: "call_member",
                },
            ],
        });

        console.log(`[Stream] Added agent ${agentUserId} to call ${callId}`);
        return { success: true, agentUserId };
    } catch (error) {
        console.error("[Stream] Failed to add agent to call:", error);
        throw error;
    }
}

/**
 * Generate token for AI agent
 */
export function generateAgentToken(agentId: string): string {
    const agentUserId = `agent_${agentId}`;
    return generateStreamToken(agentUserId);
}

