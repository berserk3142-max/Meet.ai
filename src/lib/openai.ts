import OpenAI from "openai";

// Initialize OpenAI client (server-side only)
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a meeting summary from transcript
 */
export async function generateMeetingSummary(transcript: string): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
}> {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an AI meeting assistant. Analyze the meeting transcript and provide:
1. A concise summary (2-3 sentences)
2. Key discussion points (bullet list)
3. Action items with owners if mentioned

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."]
}`,
            },
            {
                role: "user",
                content: `Meeting transcript:\n\n${transcript}`,
            },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
}

/**
 * Placeholder for transcription (in production, use Whisper API)
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
    // In production, this would:
    // 1. Download audio from URL
    // 2. Send to OpenAI Whisper API
    // 3. Return transcription

    // For now, return placeholder
    console.log("Transcription requested for:", audioUrl);
    return "This is a placeholder transcription. In production, this would be the actual meeting transcript from Whisper API.";
}
