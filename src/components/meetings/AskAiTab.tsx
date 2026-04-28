"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

interface AskAiTabProps {
    meetingId: string;
    meetingStatus: string;
}

const suggestedQuestions = [
    "What were the main action items?",
    "Summarize the key decisions",
    "What topics were discussed?",
    "Were there any disagreements?",
    "What are the next steps?",
];

export default function AskAiTab({ meetingId, meetingStatus }: AskAiTabProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: chatData, refetch } = trpc.meetings.getChatHistory.useQuery(
        { meetingId },
        { enabled: meetingStatus === "completed" }
    );

    const sendMessage = trpc.meetings.sendChatMessage.useMutation({
        onSuccess: () => {
            setInput("");
            refetch();
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData?.messages]);

    const handleSend = (message?: string) => {
        const msg = message || input;
        if (!msg.trim()) return;
        sendMessage.mutate({ meetingId, message: msg });
        if (!message) setInput("");
    };

    if (meetingStatus !== "completed") {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <span className="material-icons" style={{ fontSize: "3rem", color: "#d1d5db", display: "block", marginBottom: "1rem" }}>chat</span>
                <p style={{ fontWeight: 700, color: "#000", fontSize: "1.125rem" }}>Chat not available yet</p>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                    Ask AI is available only after the meeting is completed.
                </p>
            </div>
        );
    }

    const messages = chatData?.messages || [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Messages area */}
            <div style={{
                border: "2px solid #000", backgroundColor: "#fafafa",
                minHeight: "350px", maxHeight: "450px", overflowY: "auto",
                padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem",
            }}>
                {messages.length === 0 && !sendMessage.isPending && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                        <span className="material-icons" style={{ fontSize: "2.5rem", color: "#8B5CF6" }}>psychology</span>
                        <p style={{ fontWeight: 700, color: "#000" }}>Ask AI anything about this meeting</p>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center", maxWidth: "20rem" }}>
                            The AI has full context of your meeting transcript and summary.
                        </p>
                    </div>
                )}

                {messages.map((msg: any) => (
                    <div
                        key={msg.id}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <div style={{
                            maxWidth: "80%",
                            padding: "0.75rem 1rem",
                            border: "2px solid #000",
                            backgroundColor: msg.role === "user" ? "#8B5CF6" : "#fff",
                            color: msg.role === "user" ? "#fff" : "#000",
                            boxShadow: msg.role === "user" ? "3px 3px 0px 0px #000" : "3px 3px 0px 0px #e5e7eb",
                            fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
                        }}>
                            {msg.role === "assistant" && (
                                <span className="material-icons" style={{ fontSize: "0.875rem", color: "#8B5CF6", marginRight: "0.25rem", verticalAlign: "middle" }}>smart_toy</span>
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}

                {sendMessage.isPending && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{
                            padding: "0.75rem 1rem", border: "2px solid #000",
                            backgroundColor: "#fff", display: "flex", alignItems: "center", gap: "0.5rem",
                        }}>
                            <Loader2 style={{ width: "1rem", height: "1rem", color: "#8B5CF6" }} className="animate-spin" />
                            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length === 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {suggestedQuestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            disabled={sendMessage.isPending}
                            style={{
                                padding: "0.375rem 0.75rem", border: "2px solid #000",
                                backgroundColor: "#fff", cursor: "pointer",
                                fontSize: "0.8rem", fontWeight: 600, color: "#374151",
                                opacity: sendMessage.isPending ? 0.5 : 1,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#8B5CF6"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#374151"; }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Ask about this meeting..."
                    disabled={sendMessage.isPending}
                    style={{
                        flex: 1, padding: "0.75rem 1rem", border: "2px solid #000",
                        backgroundColor: "#fff", fontSize: "0.9rem", fontWeight: 600,
                        outline: "none", opacity: sendMessage.isPending ? 0.5 : 1,
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={sendMessage.isPending || !input.trim()}
                    style={{
                        padding: "0.75rem 1.25rem", backgroundColor: "#8B5CF6",
                        color: "#fff", border: "2px solid #000", fontWeight: 700,
                        cursor: sendMessage.isPending || !input.trim() ? "not-allowed" : "pointer",
                        opacity: sendMessage.isPending || !input.trim() ? 0.5 : 1,
                        boxShadow: "3px 3px 0px 0px #000",
                        display: "flex", alignItems: "center", gap: "0.375rem",
                    }}
                >
                    {sendMessage.isPending ? (
                        <Loader2 style={{ width: "1rem", height: "1rem" }} className="animate-spin" />
                    ) : (
                        <span className="material-icons" style={{ fontSize: "1.125rem" }}>send</span>
                    )}
                </button>
            </div>
        </div>
    );
}
