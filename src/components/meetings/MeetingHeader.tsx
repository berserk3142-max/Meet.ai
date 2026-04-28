"use client";

import Link from "next/link";
import { Phone, ArrowLeft, Play } from "lucide-react";

interface MeetingHeaderProps {
    meeting: any;
    id: string;
}

function formatDuration(ms: number | null | undefined) {
    if (!ms) return null;
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    return `${min}m ${sec}s`;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
    completed: { bg: "#a3e635", text: "#000" },
    upcoming: { bg: "#fde047", text: "#000" },
    active: { bg: "#8B5CF6", text: "#fff" },
    processing: { bg: "#ec4899", text: "#fff" },
    cancelled: { bg: "#6b7280", text: "#fff" },
};

export default function MeetingHeader({ meeting, id }: MeetingHeaderProps) {
    const status = statusConfig[meeting.status] || statusConfig.upcoming;
    const duration = formatDuration(meeting.duration);

    return (
        <>
            <Link
                href="/meetings"
                style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    color: "#6b7280", fontWeight: 700, fontSize: "0.875rem",
                    textDecoration: "none",
                }}
            >
                <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
                Back to Meetings
            </Link>

            <div style={{
                backgroundColor: "#fff", border: "3px solid #000",
                padding: "2rem", boxShadow: "8px 8px 0px 0px #8B5CF6",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{
                            fontSize: "2rem", fontWeight: 900, color: "#000",
                            fontFamily: "'Lexend', sans-serif", marginBottom: "0.75rem",
                        }}>
                            {meeting.name}
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                            <span style={{
                                padding: "0.25rem 0.75rem", fontWeight: 700,
                                fontSize: "0.75rem", textTransform: "uppercase",
                                letterSpacing: "0.1em", border: "2px solid #000",
                                backgroundColor: status.bg, color: status.text,
                            }}>
                                {meeting.status}
                            </span>
                            {meeting.agent && (
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: 600 }}>
                                    <span className="material-icons" style={{ fontSize: "1rem" }}>smart_toy</span>
                                    {meeting.agent.name}
                                </span>
                            )}
                            {duration && (
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", fontWeight: 600 }}>
                                    <span className="material-icons" style={{ fontSize: "1rem" }}>schedule</span>
                                    {duration}
                                </span>
                            )}
                        </div>
                    </div>

                    {(meeting.status === "upcoming" || meeting.status === "active") && (
                        <Link href={`/meetings/${id}/call`} style={{
                            display: "inline-flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.75rem 1.5rem", backgroundColor: "#8B5CF6",
                            color: "#fff", border: "3px solid #000",
                            boxShadow: "4px 4px 0px 0px #000", fontWeight: 700,
                            textDecoration: "none", fontSize: "0.875rem",
                        }}>
                            <Phone style={{ width: "1rem", height: "1rem" }} />
                            {meeting.status === "active" ? "Join Live" : "Start Call"}
                        </Link>
                    )}
                    {meeting.status === "completed" && meeting.recordingUrl && (
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            padding: "0.5rem 1rem", backgroundColor: "#e0f2fe",
                            border: "2px solid #000", fontWeight: 700,
                            fontSize: "0.75rem", color: "#0369a1",
                        }}>
                            <Play style={{ width: "0.875rem", height: "0.875rem" }} />
                            Recording Available
                        </span>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1.5rem", borderTop: "2px solid #e5e7eb", paddingTop: "1rem" }}>
                    <div>
                        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em" }}>Created</p>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#000" }}>
                            {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                        </p>
                    </div>
                    {meeting.startedAt && (
                        <div>
                            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em" }}>Started</p>
                            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#000" }}>
                                {new Date(meeting.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    )}
                    {meeting.endedAt && (
                        <div>
                            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em" }}>Ended</p>
                            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#000" }}>
                                {new Date(meeting.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    )}
                    <div>
                        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em" }}>Call ID</p>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#000", fontFamily: "monospace" }}>
                            {meeting.callId ? meeting.callId.slice(0, 12) + "..." : "—"}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
