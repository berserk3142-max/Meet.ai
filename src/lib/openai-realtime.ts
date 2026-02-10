/**
 * OpenAI Realtime API Service
 * Handles real-time voice conversation with AI agent
 * 
 * Uses ephemeral token approach for client-side WebSocket connection
 */

const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";

export interface RealtimeSession {
    ephemeralToken: string;
    agentName: string;
    instructions: string;
}

/**
 * Create an ephemeral token for Realtime API access
 * This token is sent to the client to establish a WebSocket connection
 */
export async function createRealtimeSession(agentName: string, agentDescription?: string): Promise<RealtimeSession> {
    const instructions = getAgentInstructions(agentName, agentDescription);

    try {
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: REALTIME_MODEL,
                voice: "alloy",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Realtime] Session creation failed:", response.status, errorText);

            // If Realtime API isn't available, throw a specific error
            if (response.status === 404 || response.status === 403) {
                throw new Error("REALTIME_NOT_AVAILABLE");
            }
            throw new Error(`Failed to create session: ${errorText}`);
        }

        const data = await response.json();

        return {
            ephemeralToken: data.client_secret?.value || data.client_secret,
            agentName,
            instructions,
        };
    } catch (error: any) {
        console.error("[Realtime] Error:", error.message);

        // Re-throw with specific error for handling
        if (error.message === "REALTIME_NOT_AVAILABLE") {
            throw error;
        }
        throw new Error("REALTIME_NOT_AVAILABLE");
    }
}

/**
 * Get agent instructions based on agent configuration
 */
export function getAgentInstructions(agentName: string, agentDescription?: string): string {
    return `You are ${agentName}, an AI meeting assistant.
${agentDescription ? `Your role: ${agentDescription}` : ""}

Your responsibilities:
- Actively participate in the meeting conversation
- Provide helpful insights and answers when asked
- Be professional, concise, and helpful

Keep your responses conversational and natural. Listen carefully and respond appropriately.`;
}
