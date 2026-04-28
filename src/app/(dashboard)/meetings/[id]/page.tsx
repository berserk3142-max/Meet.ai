"use client";

import { use, useState } from "react";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import MeetingHeader from "@/components/meetings/MeetingHeader";
import SummaryTab from "@/components/meetings/SummaryTab";
import TranscriptTab from "@/components/meetings/TranscriptTab";
import RecordingTab from "@/components/meetings/RecordingTab";
import AskAiTab from "@/components/meetings/AskAiTab";

interface MeetingDetailPageProps {
    params: Promise<{ id: string }>;
}

type TabKey = "details" | "summary" | "transcript" | "recording" | "chat";

const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "details", label: "Details", icon: "info" },
    { key: "summary", label: "Summary", icon: "auto_awesome" },
    { key: "transcript", label: "Transcript", icon: "description" },
    { key: "recording", label: "Recording", icon: "videocam" },
    { key: "chat", label: "Ask AI", icon: "psychology" },
];

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<TabKey>("details");

    const { data: meeting, isLoading, error } = trpc.meetings.getById.useQuery({ id });

    const { data: transcriptData } = trpc.meetings.getTranscript.useQuery(
        { id },
        { enabled: activeTab === "transcript" }
    );

    const { data: summaryData } = trpc.meetings.getSummary.useQuery(
        { id },
        { enabled: activeTab === "summary" }
    );

    if (isLoading) {
        return (
            <div style={{ padding: "3rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <Loader2 className="animate-spin" style={{ width: "2rem", height: "2rem", color: "#8B5CF6" }} />
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div style={{ padding: "3rem" }}>
                <div style={{
                    maxWidth: "40rem", margin: "0 auto", textAlign: "center",
                    backgroundColor: "#fff", border: "3px solid #000", padding: "3rem",
                    boxShadow: "6px 6px 0px 0px #000",
                }}>
                    <span className="material-icons" style={{ fontSize: "3rem", color: "#ef4444", display: "block", marginBottom: "1rem" }}>error</span>
                    <p style={{ fontWeight: 700, color: "#000", fontSize: "1.25rem" }}>Meeting not found</p>
                    <Link href="/meetings" style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        marginTop: "1rem", color: "#8B5CF6", fontWeight: 700,
                        textDecoration: "none", fontSize: "0.875rem",
                    }}>
                        ← Back to meetings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem 3rem", minHeight: "100vh" }}>
            <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <MeetingHeader meeting={meeting} id={id} />

                {/* Tab Bar */}
                <div style={{
                    display: "flex", gap: "0", border: "3px solid #000",
                    backgroundColor: "#fff", overflow: "hidden",
                }}>
                    {tabs.map((tab, i) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, display: "flex", alignItems: "center",
                                justifyContent: "center", gap: "0.375rem",
                                padding: "0.75rem 0.5rem", fontWeight: 700,
                                fontSize: "0.8rem", cursor: "pointer", border: "none",
                                borderRight: i < tabs.length - 1 ? "2px solid #000" : "none",
                                backgroundColor: activeTab === tab.key ? "#8B5CF6" : "#fff",
                                color: activeTab === tab.key ? "#fff" : "#6b7280",
                                transition: "all 0.15s",
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: "1.125rem" }}>{tab.icon}</span>
                            <span style={{ display: "none" }} className="sm-show">{tab.label}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    backgroundColor: "#fff", border: "3px solid #000",
                    padding: "2rem", boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.1)",
                }}>
                    {activeTab === "details" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#000", fontFamily: "'Lexend', sans-serif" }}>
                                Meeting Details
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Meeting Name</p>
                                    <p style={{ fontWeight: 600, color: "#000" }}>{meeting.name}</p>
                                </div>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Agent</p>
                                    <p style={{ fontWeight: 600, color: "#000" }}>{meeting.agent?.name || meeting.agentId}</p>
                                </div>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Meeting ID</p>
                                    <p style={{ fontWeight: 600, color: "#000", fontFamily: "monospace", fontSize: "0.85rem" }}>{meeting.id}</p>
                                </div>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Call ID</p>
                                    <p style={{ fontWeight: 600, color: "#000", fontFamily: "monospace", fontSize: "0.85rem" }}>{meeting.callId || "—"}</p>
                                </div>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Created</p>
                                    <p style={{ fontWeight: 600, color: "#000" }}>{meeting.createdAt ? new Date(meeting.createdAt).toLocaleString() : "-"}</p>
                                </div>
                                <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Updated</p>
                                    <p style={{ fontWeight: 600, color: "#000" }}>{meeting.updatedAt ? new Date(meeting.updatedAt).toLocaleString() : "-"}</p>
                                </div>
                                {meeting.startedAt && (
                                    <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Started At</p>
                                        <p style={{ fontWeight: 600, color: "#000" }}>{new Date(meeting.startedAt).toLocaleString()}</p>
                                    </div>
                                )}
                                {meeting.endedAt && (
                                    <div style={{ border: "2px solid #e5e7eb", padding: "1rem" }}>
                                        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Ended At</p>
                                        <p style={{ fontWeight: 600, color: "#000" }}>{new Date(meeting.endedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick status indicators */}
                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", borderTop: "2px solid #e5e7eb", paddingTop: "1rem" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", border: "2px solid #000",
                                    backgroundColor: meeting.summary ? "#dcfce7" : "#fee2e2",
                                    fontSize: "0.75rem", fontWeight: 700,
                                }}>
                                    <span className="material-icons" style={{ fontSize: "0.875rem" }}>{meeting.summary ? "check_circle" : "cancel"}</span>
                                    Summary
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", border: "2px solid #000",
                                    backgroundColor: meeting.transcript ? "#dcfce7" : "#fee2e2",
                                    fontSize: "0.75rem", fontWeight: 700,
                                }}>
                                    <span className="material-icons" style={{ fontSize: "0.875rem" }}>{meeting.transcript ? "check_circle" : "cancel"}</span>
                                    Transcript
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.75rem", border: "2px solid #000",
                                    backgroundColor: meeting.recordingUrl ? "#dcfce7" : "#fee2e2",
                                    fontSize: "0.75rem", fontWeight: 700,
                                }}>
                                    <span className="material-icons" style={{ fontSize: "0.875rem" }}>{meeting.recordingUrl ? "check_circle" : "cancel"}</span>
                                    Recording
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "summary" && (
                        <SummaryTab summaryData={summaryData} meetingStatus={meeting.status} />
                    )}

                    {activeTab === "transcript" && (
                        <TranscriptTab transcriptData={transcriptData} meetingStatus={meeting.status} />
                    )}

                    {activeTab === "recording" && (
                        <RecordingTab meeting={meeting} />
                    )}

                    {activeTab === "chat" && (
                        <AskAiTab meetingId={id} meetingStatus={meeting.status} />
                    )}
                </div>
            </div>
        </div>
    );
}
