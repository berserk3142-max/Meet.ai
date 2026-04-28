"use client";

interface SummaryTabProps {
    summaryData: any;
    meetingStatus: string;
}

const sentimentColors: Record<string, { bg: string; text: string; emoji: string }> = {
    positive: { bg: "#dcfce7", text: "#166534", emoji: "😊" },
    neutral: { bg: "#fef3c7", text: "#92400e", emoji: "😐" },
    negative: { bg: "#fee2e2", text: "#991b1b", emoji: "😟" },
};

export default function SummaryTab({ summaryData, meetingStatus }: SummaryTabProps) {
    if (meetingStatus === "processing") {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <span className="material-icons" style={{ fontSize: "3rem", color: "#8B5CF6", display: "block", marginBottom: "1rem" }}>hourglass_top</span>
                <p style={{ fontWeight: 700, color: "#000", fontSize: "1.125rem" }}>Processing your meeting...</p>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>AI is analyzing the transcript and generating insights.</p>
            </div>
        );
    }

    if (!summaryData?.hasSummary) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <span className="material-icons" style={{ fontSize: "3rem", color: "#d1d5db", display: "block", marginBottom: "1rem" }}>summarize</span>
                <p style={{ fontWeight: 700, color: "#000", fontSize: "1.125rem" }}>No summary yet</p>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                    {meetingStatus === "upcoming" ? "Summary will be generated after the meeting ends." : "Summary is being generated..."}
                </p>
            </div>
        );
    }

    const s = summaryData.summary;
    const sentiment = sentimentColors[s?.sentiment?.overall] || sentimentColors.neutral;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Overview */}
            {s?.summary && (
                <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #000", padding: "1.25rem", boxShadow: "4px 4px 0px 0px #a3e635" }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#166534", marginBottom: "0.5rem" }}>
                        <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle", marginRight: "0.25rem" }}>auto_awesome</span>
                        AI Summary
                    </h4>
                    <p style={{ color: "#000", lineHeight: 1.7, fontSize: "0.95rem" }}>{s.summary}</p>
                </div>
            )}

            {/* Sentiment + Stats Row */}
            {s?.sentiment && (
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ backgroundColor: sentiment.bg, border: "2px solid #000", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.25rem" }}>{sentiment.emoji}</span>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: sentiment.text }}>Sentiment</p>
                            <p style={{ fontWeight: 800, color: sentiment.text, textTransform: "capitalize" }}>{s.sentiment.overall}</p>
                        </div>
                    </div>
                    <div style={{ backgroundColor: "#ede9fe", border: "2px solid #000", padding: "0.75rem 1.25rem" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#6d28d9" }}>Key Points</p>
                        <p style={{ fontWeight: 800, color: "#6d28d9", fontSize: "1.5rem" }}>{s.keyPoints?.length || 0}</p>
                    </div>
                    <div style={{ backgroundColor: "#fef3c7", border: "2px solid #000", padding: "0.75rem 1.25rem" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", color: "#92400e" }}>Action Items</p>
                        <p style={{ fontWeight: 800, color: "#92400e", fontSize: "1.5rem" }}>{s.actionItems?.length || 0}</p>
                    </div>
                </div>
            )}

            {/* Key Points */}
            {s?.keyPoints?.length > 0 && (
                <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#8B5CF6", padding: "0.75rem 1rem", borderBottom: "2px solid #000" }}>
                        <h4 style={{ fontWeight: 700, color: "#fff", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Key Points
                        </h4>
                    </div>
                    <div style={{ padding: "1rem" }}>
                        {s.keyPoints.map((pt: string, i: number) => (
                            <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < s.keyPoints.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                                <span style={{ backgroundColor: "#8B5CF6", color: "#fff", fontWeight: 800, fontSize: "0.7rem", width: "1.5rem", height: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {i + 1}
                                </span>
                                <p style={{ color: "#000", fontSize: "0.9rem", lineHeight: 1.5 }}>{pt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Items */}
            {s?.actionItems?.length > 0 && (
                <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#f59e0b", padding: "0.75rem 1rem", borderBottom: "2px solid #000" }}>
                        <h4 style={{ fontWeight: 700, color: "#000", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Action Items
                        </h4>
                    </div>
                    <div style={{ padding: "1rem" }}>
                        {s.actionItems.map((item: string, i: number) => (
                            <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.5rem 0", borderBottom: i < s.actionItems.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                                <span style={{ width: "1.25rem", height: "1.25rem", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "0.1rem" }}>
                                    <span className="material-icons" style={{ fontSize: "0.875rem" }}>check</span>
                                </span>
                                <p style={{ color: "#000", fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Decisions Made */}
            {s?.decisonsMade?.length > 0 && (
                <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#a3e635", padding: "0.75rem 1rem", borderBottom: "2px solid #000" }}>
                        <h4 style={{ fontWeight: 700, color: "#000", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Decisions Made
                        </h4>
                    </div>
                    <div style={{ padding: "1rem" }}>
                        {s.decisonsMade.map((d: string, i: number) => (
                            <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < s.decisonsMade.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                                <span className="material-icons" style={{ fontSize: "1.125rem", color: "#16a34a", flexShrink: 0 }}>gavel</span>
                                <p style={{ color: "#000", fontSize: "0.9rem", lineHeight: 1.5 }}>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Speaker Highlights */}
            {s?.speakerHighlights?.length > 0 && (
                <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#ec4899", padding: "0.75rem 1rem", borderBottom: "2px solid #000" }}>
                        <h4 style={{ fontWeight: 700, color: "#fff", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Speaker Highlights
                        </h4>
                    </div>
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {s.speakerHighlights.map((sh: any, i: number) => (
                            <div key={i} style={{ borderLeft: "4px solid #ec4899", paddingLeft: "1rem" }}>
                                <p style={{ fontWeight: 700, color: "#000", marginBottom: "0.25rem" }}>{sh.speaker}</p>
                                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                                    {sh.mainPoints?.map((p: string, j: number) => (
                                        <li key={j} style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.6 }}>{p}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meeting Notes */}
            {s?.meetingNotes && (
                <div style={{ border: "2px solid #000", backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#000", padding: "0.75rem 1rem", borderBottom: "2px solid #000" }}>
                        <h4 style={{ fontWeight: 700, color: "#fff", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Meeting Notes
                        </h4>
                    </div>
                    <div style={{ padding: "1.25rem", whiteSpace: "pre-wrap", color: "#000", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        {s.meetingNotes}
                    </div>
                </div>
            )}
        </div>
    );
}
