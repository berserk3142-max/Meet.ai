"use client";

import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user } = useUser();
    const { data, isLoading } = trpc.dashboard.getOverview.useQuery();
    const { data: meetingsData } = trpc.meetings.getMany.useQuery({
        page: 1,
        pageSize: 5,
    });

    const meetingCount = data?.upcomingMeetings ?? 0;
    const agentCount = data?.activeAgents ?? 0;
    const hoursSaved = data?.hoursSaved ?? 0;

    const userName = user?.firstName || user?.username || "User";

    const colors = ["#ec4899", "#3b82f6", "#8B5CF6", "#a3e635", "#f97316"];

    const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
        completed: { bg: "#e5e7eb", text: "#000000", border: "#000000" },
        upcoming: { bg: "#fde047", text: "#000000", border: "#000000" },
        active: { bg: "#8B5CF6", text: "#ffffff", border: "#000000" },
        processing: { bg: "#ec4899", text: "#ffffff", border: "#000000" },
        cancelled: { bg: "#6b7280", text: "#ffffff", border: "#000000" },
    };

    return (
        <div
            style={{
                padding: "2rem 3rem",
                minHeight: "100vh",
            }}
        >
            <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
                {/* ── Header ── */}
                <header style={{ marginBottom: "3rem" }}>
                    <h1
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                            fontWeight: 900,
                            marginBottom: "0.5rem",
                            letterSpacing: "-0.025em",
                            color: "#000000",
                            fontFamily: "'Lexend', sans-serif",
                            lineHeight: 1.1,
                        }}
                    >
                        Welcome back,
                        <br />
                        <span
                            style={{
                                color: "#8B5CF6",
                                textDecoration: "underline",
                                textDecorationColor: "#ffffff",
                                textDecorationThickness: "4px",
                                textUnderlineOffset: "6px",
                            }}
                        >
                            {userName}!
                        </span>
                    </h1>
                    <p
                        style={{
                            fontSize: "1.25rem",
                            color: "#6b7280",
                            fontWeight: 500,
                            borderLeft: "4px solid #8B5CF6",
                            paddingLeft: "1rem",
                            marginTop: "1rem",
                        }}
                    >
                        Here&apos;s what&apos;s happening with your meetings today.
                    </p>
                </header>

                {/* ── Stats Cards ── */}
                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "2rem",
                    }}
                >
                    {/* Upcoming Meetings */}
                    <div
                        className="neo-card"
                        style={{
                            backgroundColor: "#ffffff",
                            border: "3px solid #000000",
                            padding: "1.5rem",
                            boxShadow: "6px 6px 0px 0px #8B5CF6",
                            cursor: "default",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "1rem",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#6b7280",
                                    fontFamily: "'Lexend', sans-serif",
                                }}
                            >
                                Upcoming Meetings
                            </h3>
                            <span
                                className="material-icons"
                                style={{ fontSize: "1.875rem", color: "#8B5CF6" }}
                            >
                                calendar_today
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: "3.75rem",
                                fontWeight: 900,
                                color: "#000000",
                                fontFamily: "'Lexend', sans-serif",
                            }}
                        >
                            {isLoading ? (
                                <Loader2
                                    className="animate-spin"
                                    style={{ width: "2rem", height: "2rem" }}
                                />
                            ) : (
                                meetingCount
                            )}
                        </div>
                    </div>

                    {/* Active Agents */}
                    <div
                        className="neo-card"
                        style={{
                            backgroundColor: "#ffffff",
                            border: "3px solid #000000",
                            padding: "1.5rem",
                            boxShadow: "6px 6px 0px 0px #8B5CF6",
                            cursor: "default",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "1rem",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#6b7280",
                                    fontFamily: "'Lexend', sans-serif",
                                }}
                            >
                                Active Agents
                            </h3>
                            <span
                                className="material-icons"
                                style={{ fontSize: "1.875rem", color: "#a3e635" }}
                            >
                                smart_toy
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: "3.75rem",
                                fontWeight: 900,
                                color: "#000000",
                                fontFamily: "'Lexend', sans-serif",
                            }}
                        >
                            {isLoading ? (
                                <Loader2
                                    className="animate-spin"
                                    style={{ width: "2rem", height: "2rem" }}
                                />
                            ) : (
                                agentCount
                            )}
                        </div>
                    </div>

                    {/* Hours Saved */}
                    <div
                        className="neo-card"
                        style={{
                            backgroundColor: "#ffffff",
                            border: "3px solid #000000",
                            padding: "1.5rem",
                            boxShadow: "6px 6px 0px 0px #8B5CF6",
                            cursor: "default",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "1rem",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#6b7280",
                                    fontFamily: "'Lexend', sans-serif",
                                }}
                            >
                                Hours Saved
                            </h3>
                            <span
                                className="material-icons"
                                style={{ fontSize: "1.875rem", color: "#ec4899" }}
                            >
                                schedule
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: "3.75rem",
                                fontWeight: 900,
                                color: "#000000",
                                fontFamily: "'Lexend', sans-serif",
                            }}
                        >
                            {isLoading ? (
                                <Loader2
                                    className="animate-spin"
                                    style={{ width: "2rem", height: "2rem" }}
                                />
                            ) : (
                                hoursSaved
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Quick Actions ── */}
                <section style={{ marginTop: "3rem" }}>
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            border: "3px solid #000000",
                            padding: "2rem",
                            boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.15)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                marginBottom: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontFamily: "'Lexend', sans-serif",
                                color: "#000000",
                            }}
                        >
                            <span className="material-icons">bolt</span> Quick Actions
                        </h2>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "1.5rem",
                            }}
                        >
                            <Link
                                href="/meetings"
                                className="neo-btn"
                                style={{
                                    backgroundColor: "#8B5CF6",
                                    color: "#ffffff",
                                    fontSize: "1.125rem",
                                    fontWeight: 700,
                                    padding: "1rem 2rem",
                                    border: "3px solid #000000",
                                    boxShadow: "4px 4px 0px 0px #000000",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-icons">videocam</span>
                                Start Meeting
                            </Link>
                            <Link
                                href="/agents"
                                className="neo-btn"
                                style={{
                                    backgroundColor: "#a3e635",
                                    color: "#000000",
                                    fontSize: "1.125rem",
                                    fontWeight: 700,
                                    padding: "1rem 2rem",
                                    border: "3px solid #000000",
                                    boxShadow: "4px 4px 0px 0px #000000",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-icons">add_circle</span>
                                Create Agent
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Recent Activity ── */}
                <section style={{ marginTop: "3rem", paddingBottom: "3rem" }}>
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#6b7280",
                            fontFamily: "'Lexend', sans-serif",
                        }}
                    >
                        Recent Activity
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {isLoading ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "3rem",
                                    border: "2px solid #000000",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                <Loader2
                                    className="animate-spin"
                                    style={{
                                        width: "2rem",
                                        height: "2rem",
                                        color: "#8B5CF6",
                                    }}
                                />
                            </div>
                        ) : meetingsData?.meetings &&
                            meetingsData.meetings.length > 0 ? (
                            meetingsData.meetings.map((meeting) => {
                                const initials = meeting.name
                                    .split(" ")
                                    .map((w: string) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase();

                                const colorIndex =
                                    meeting.name.charCodeAt(0) % colors.length;

                                const status =
                                    statusConfig[meeting.status] ||
                                    statusConfig.upcoming;

                                return (
                                    <Link
                                        key={meeting.id}
                                        href={`/meetings/${meeting.id}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "1rem",
                                            border: "2px solid #000000",
                                            backgroundColor: "#ffffff",
                                            textDecoration: "none",
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "#f9fafb")
                                        }
                                        onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            "#ffffff")
                                        }
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "1rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "3rem",
                                                    height: "3rem",
                                                    backgroundColor:
                                                        colors[colorIndex],
                                                    border: "2px solid #000000",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    fontSize: "1.25rem",
                                                }}
                                            >
                                                {initials}
                                            </div>
                                            <div>
                                                <h4
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: "1.125rem",
                                                        color: "#000000",
                                                    }}
                                                >
                                                    {meeting.name}
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        color: "#6b7280",
                                                        fontFamily: "monospace",
                                                    }}
                                                >
                                                    {new Date(
                                                        meeting.createdAt
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                padding: "0.25rem 0.75rem",
                                                border: `1px solid ${status.border}`,
                                                backgroundColor: status.bg,
                                                color: status.text,
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.1em",
                                            }}
                                        >
                                            {meeting.status}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "3rem",
                                    border: "2px solid #000000",
                                    backgroundColor: "#ffffff",
                                    color: "#6b7280",
                                }}
                            >
                                <span
                                    className="material-icons"
                                    style={{
                                        fontSize: "2.5rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    event_busy
                                </span>
                                <p style={{ fontWeight: 700 }}>
                                    No recent meetings
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    Start a meeting to see activity here.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
