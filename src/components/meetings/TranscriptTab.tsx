"use client";

import { useState } from "react";

interface TranscriptTabProps {
    transcriptData: any;
    meetingStatus: string;
}

const speakerColors = ["#8B5CF6", "#ec4899", "#3b82f6", "#a3e635", "#f97316", "#06b6d4"];

export default function TranscriptTab({ transcriptData, meetingStatus }: TranscriptTabProps) {
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState(false);

    if (!transcriptData?.hasTranscript) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <span className="material-icons" style={{ fontSize: "3rem", color: "#d1d5db", display: "block", marginBottom: "1rem" }}>description</span>
                <p style={{ fontWeight: 700, color: "#000", fontSize: "1.125rem" }}>No transcript yet</p>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                    {meetingStatus === "processing" ? "Transcript is being processed..." : "Transcript will be available after the meeting ends."}
                </p>
            </div>
        );
    }

    const raw = transcriptData.transcript;
    let entries: { speaker?: string; text: string }[] = [];

    if (raw?.cleaned) {
        entries = [{ text: raw.cleaned }];
    } else if (Array.isArray(raw)) {
        entries = raw.map((e: any) => ({ speaker: e.speaker, text: e.text || e.content || "" }));
    } else if (typeof raw === "string") {
        entries = [{ text: raw }];
    } else if (raw?.raw) {
        entries = [{ text: typeof raw.raw === "string" ? raw.raw : JSON.stringify(raw.raw, null, 2) }];
    } else {
        entries = [{ text: JSON.stringify(raw, null, 2) }];
    }

    const filtered = search
        ? entries.filter(e => e.text.toLowerCase().includes(search.toLowerCase()) || e.speaker?.toLowerCase().includes(search.toLowerCase()))
        : entries;

    const handleCopy = () => {
        const text = entries.map(e => e.speaker ? `${e.speaker}: ${e.text}` : e.text).join("\n\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <span className="material-icons" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.125rem", color: "#9ca3af" }}>search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search transcript..."
                        style={{
                            width: "100%", padding: "0.625rem 0.75rem 0.625rem 2.25rem",
                            border: "2px solid #000", backgroundColor: "#fff",
                            fontSize: "0.875rem", fontWeight: 600, outline: "none",
                        }}
                    />
                </div>
                <button
                    onClick={handleCopy}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.625rem 1rem", border: "2px solid #000",
                        backgroundColor: copied ? "#a3e635" : "#fff", fontWeight: 700,
                        fontSize: "0.8rem", cursor: "pointer",
                    }}
                >
                    <span className="material-icons" style={{ fontSize: "1rem" }}>{copied ? "check" : "content_copy"}</span>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* Entries */}
            <div style={{ border: "2px solid #000", backgroundColor: "#fff", maxHeight: "500px", overflowY: "auto" }}>
                {filtered.length === 0 ? (
                    <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>No results found.</p>
                ) : (
                    filtered.map((entry, i) => {
                        const colorIdx = entry.speaker ? entry.speaker.charCodeAt(0) % speakerColors.length : 0;
                        return (
                            <div key={i} style={{
                                display: "flex", gap: "1rem", padding: "0.875rem 1rem",
                                borderBottom: i < filtered.length - 1 ? "1px solid #e5e7eb" : "none",
                                borderLeft: `4px solid ${entry.speaker ? speakerColors[colorIdx] : "#8B5CF6"}`,
                            }}>
                                <div style={{ flex: 1 }}>
                                    {entry.speaker && (
                                        <p style={{ fontWeight: 700, fontSize: "0.8rem", color: speakerColors[colorIdx], marginBottom: "0.25rem" }}>
                                            {entry.speaker}
                                        </p>
                                    )}
                                    <p style={{ color: "#000", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{entry.text}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "right" }}>
                {filtered.length} of {entries.length} entries
            </p>
        </div>
    );
}
