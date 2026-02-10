import OpenAI from "openai";

// Initialize OpenAI client (server-side only)
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Common filler words to remove from transcripts
 */
const FILLER_WORDS = [
    "um", "uh", "like", "you know", "i mean", "so", "actually",
    "basically", "literally", "right", "okay so", "well"
];

/**
 * Clean transcript by removing filler words and normalizing whitespace
 */
export function cleanTranscript(transcript: string): string {
    let cleaned = transcript;

    // Remove filler words (case insensitive, word boundaries)
    for (const filler of FILLER_WORDS) {
        const regex = new RegExp(`\\b${filler}\\b[,.]?\\s*`, "gi");
        cleaned = cleaned.replace(regex, "");
    }

    // Normalize whitespace
    cleaned = cleaned
        .replace(/\s+/g, " ")
        .replace(/\s+([.,!?])/g, "$1")
        .trim();

    return cleaned;
}

/**
 * Chunk transcript for handling large transcripts that exceed token limits
 * Each chunk will be approximately maxTokens * 4 characters (rough estimate)
 */
export function chunkTranscript(transcript: string, maxChunkSize: number = 8000): string[] {
    const chunks: string[] = [];
    const sentences = transcript.split(/(?<=[.!?])\s+/);
    let currentChunk = "";

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
        } else {
            currentChunk += " " + sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [transcript];
}

/**
 * Enhanced meeting summary interface
 */
export interface MeetingSummaryResult {
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    decisonsMade: string[];
    sentiment: {
        overall: "positive" | "neutral" | "negative";
        confidence: number;
    };
    speakerHighlights?: {
        speaker: string;
        mainPoints: string[];
    }[];
    meetingNotes: string;
}

/**
 * Generate an enhanced meeting summary from transcript
 * Includes sentiment analysis, speaker highlights, and structured notes
 */
export async function generateMeetingSummary(transcript: string): Promise<MeetingSummaryResult> {
    // Clean the transcript first
    const cleanedTranscript = cleanTranscript(transcript);

    // Check if we need to chunk
    const chunks = chunkTranscript(cleanedTranscript);

    if (chunks.length > 1) {
        // For very long transcripts, summarize each chunk and combine
        return await summarizeLongTranscript(chunks);
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert AI meeting assistant. Analyze the meeting transcript thoroughly and provide a comprehensive analysis.

Your response must be valid JSON with this exact structure:
{
  "summary": "A concise 2-3 sentence summary of the meeting",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "actionItems": ["Action item with owner if mentioned", ...],
  "decisonsMade": ["Decision 1", "Decision 2", ...],
  "sentiment": {
    "overall": "positive" | "neutral" | "negative",
    "confidence": 0.0 to 1.0
  },
  "speakerHighlights": [
    {"speaker": "Speaker name or role", "mainPoints": ["Point 1", "Point 2"]}
  ],
  "meetingNotes": "Formatted meeting notes in markdown style with headers and bullet points"
}

Guidelines:
- Extract action items with responsible persons if mentioned
- Identify all decisions made during the meeting
- Analyze overall sentiment (positive, neutral, or negative)
- If speaker names are identifiable, provide per-speaker highlights
- Create clean, professional meeting notes suitable for sharing`,
            },
            {
                role: "user",
                content: `Please analyze this meeting transcript:\n\n${cleanedTranscript}`,
            },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";

    try {
        const parsed = JSON.parse(content);
        return {
            summary: parsed.summary || "No summary available",
            keyPoints: parsed.keyPoints || [],
            actionItems: parsed.actionItems || [],
            decisonsMade: parsed.decisonsMade || [],
            sentiment: parsed.sentiment || { overall: "neutral", confidence: 0.5 },
            speakerHighlights: parsed.speakerHighlights || [],
            meetingNotes: parsed.meetingNotes || "",
        };
    } catch {
        return {
            summary: "Failed to parse meeting summary",
            keyPoints: [],
            actionItems: [],
            decisonsMade: [],
            sentiment: { overall: "neutral", confidence: 0 },
            meetingNotes: "",
        };
    }
}

/**
 * Summarize long transcripts by processing chunks and combining
 */
async function summarizeLongTranscript(chunks: string[]): Promise<MeetingSummaryResult> {
    console.log(`[OpenAI] Processing ${chunks.length} transcript chunks`);

    // Summarize each chunk
    const chunkSummaries: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Summarize this portion of a meeting transcript. Focus on key points, decisions, and action items. Keep it concise.",
                },
                {
                    role: "user",
                    content: `Transcript part ${i + 1} of ${chunks.length}:\n\n${chunks[i]}`,
                },
            ],
        });
        chunkSummaries.push(completion.choices[0]?.message?.content || "");
    }

    // Combine all summaries and generate final analysis
    const combinedSummary = chunkSummaries.join("\n\n---\n\n");

    const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are combining multiple meeting summary segments into one comprehensive analysis.

Your response must be valid JSON with this exact structure:
{
  "summary": "A concise 2-3 sentence summary of the entire meeting",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "actionItems": ["Action item with owner if mentioned", ...],
  "decisonsMade": ["Decision 1", "Decision 2", ...],
  "sentiment": {
    "overall": "positive" | "neutral" | "negative",
    "confidence": 0.0 to 1.0
  },
  "speakerHighlights": [],
  "meetingNotes": "Formatted meeting notes in markdown style"
}`,
            },
            {
                role: "user",
                content: `Combine these meeting summaries into one comprehensive analysis:\n\n${combinedSummary}`,
            },
        ],
        response_format: { type: "json_object" },
    });

    const content = finalCompletion.choices[0]?.message?.content || "{}";

    try {
        const parsed = JSON.parse(content);
        return {
            summary: parsed.summary || "No summary available",
            keyPoints: parsed.keyPoints || [],
            actionItems: parsed.actionItems || [],
            decisonsMade: parsed.decisonsMade || [],
            sentiment: parsed.sentiment || { overall: "neutral", confidence: 0.5 },
            speakerHighlights: parsed.speakerHighlights || [],
            meetingNotes: parsed.meetingNotes || "",
        };
    } catch {
        return {
            summary: "Failed to parse combined meeting summary",
            keyPoints: [],
            actionItems: [],
            decisonsMade: [],
            sentiment: { overall: "neutral", confidence: 0 },
            meetingNotes: "",
        };
    }
}

/**
 * Fetch transcript from a URL
 */
export async function fetchTranscriptFromUrl(url: string): Promise<string> {
    try {
        console.log(`[OpenAI] Fetching transcript from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch transcript: ${response.status}`);
        }

        const data = await response.json();

        // Stream transcripts can come in different formats
        if (typeof data === "string") {
            return data;
        }

        // If it's an array of transcript segments
        if (Array.isArray(data)) {
            return data
                .map((segment: { text?: string; speaker?: string }) => {
                    if (segment.speaker) {
                        return `${segment.speaker}: ${segment.text}`;
                    }
                    return segment.text || "";
                })
                .join("\n");
        }

        // If it has a text or transcript property
        if (data.text) return data.text;
        if (data.transcript) return data.transcript;

        return JSON.stringify(data);
    } catch (error) {
        console.error("[OpenAI] Error fetching transcript:", error);
        throw error;
    }
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

/**
 * Chat message interface for conversation history
 */
export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

/**
 * Chat with AI about a specific meeting transcript
 * Uses transcript + summary as context for contextual Q&A
 */
export async function chatWithTranscript({
    transcript,
    summary,
    userMessage,
    chatHistory = [],
}: {
    transcript: string;
    summary: string | null;
    userMessage: string;
    chatHistory?: ChatMessage[];
}): Promise<string> {
    // Truncate transcript if too long (keep under ~12k chars for gpt-4o-mini context)
    const maxTranscriptLength = 12000;
    const truncatedTranscript = transcript.length > maxTranscriptLength
        ? transcript.substring(0, maxTranscriptLength) + "\n\n[... transcript truncated for length ...]"
        : transcript;

    const systemPrompt = `You are an intelligent AI meeting assistant. You have access to a specific meeting's transcript and summary. Answer the user's questions based ONLY on this meeting's content. Be concise, accurate, and helpful.

If the user asks something not covered in the meeting, say so clearly.

=== MEETING SUMMARY ===
${summary || "No summary available."}

=== MEETING TRANSCRIPT ===
${truncatedTranscript}

Guidelines:
- Answer based strictly on the meeting content
- Quote specific parts of the transcript when relevant
- If asked for action items, decisions, or key points, extract them from the transcript
- Be conversational but professional
- If uncertain, indicate your confidence level`;

    // Build messages array: system + history + new user message
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        // Include last 10 messages of history to stay within token limits
        ...chatHistory.slice(-10),
        { role: "user", content: userMessage },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("[OpenAI] Chat error:", error);
        throw new Error("Failed to generate AI response");
    }
}

