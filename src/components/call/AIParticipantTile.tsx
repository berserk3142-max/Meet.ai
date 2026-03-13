"use client";

import { Bot, Mic, MicOff, Sparkles } from "lucide-react";
import type { AgentStatus } from "./AIVoiceAgent";

interface AIParticipantTileProps {
    agentName: string;
    status: AgentStatus;
    isMuted: boolean;
}

/**
 * AIParticipantTile — Custom tile rendered inside the video grid
 * for the AI agent participant. Shows an animated avatar with
 * status indicators instead of a video feed.
 */
export function AIParticipantTile({ agentName, status, isMuted }: AIParticipantTileProps) {
    const isActive = status === "connected" || status === "speaking" || status === "listening";

    return (
        <div className="ai-participant-tile">
            {/* Animated background rings */}
            {status === "speaking" && (
                <>
                    <div className="ai-tile-ring ai-tile-ring--1" />
                    <div className="ai-tile-ring ai-tile-ring--2" />
                    <div className="ai-tile-ring ai-tile-ring--3" />
                </>
            )}

            {/* Center avatar area */}
            <div className="ai-tile-content">
                {/* Avatar */}
                <div className={`ai-tile-avatar ${status === "speaking" ? "ai-tile-avatar--speaking" :
                        status === "listening" ? "ai-tile-avatar--listening" :
                            isActive ? "ai-tile-avatar--active" : ""
                    }`}>
                    <Bot className="ai-tile-bot-icon" />
                </div>

                {/* Name */}
                <p className="ai-tile-name">{agentName}</p>

                {/* Status badge */}
                <div className={`ai-tile-status ${status === "speaking" ? "ai-tile-status--speaking" :
                        status === "listening" ? "ai-tile-status--listening" :
                            isActive ? "ai-tile-status--active" : "ai-tile-status--idle"
                    }`}>
                    {status === "speaking" && (
                        <>
                            <div className="ai-tile-bars">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className="ai-tile-bar" style={{ animationDelay: `${i * 0.08}s` }} />
                                ))}
                            </div>
                            <span>Speaking</span>
                        </>
                    )}
                    {status === "listening" && (
                        <>
                            <Mic className="ai-tile-status-icon" />
                            <span>Listening</span>
                        </>
                    )}
                    {status === "connected" && (
                        <>
                            <Sparkles className="ai-tile-status-icon" />
                            <span>Ready</span>
                        </>
                    )}
                    {status === "connecting" && <span>Connecting…</span>}
                    {(status === "idle" || status === "error" || status === "unavailable") && (
                        <span>Offline</span>
                    )}
                </div>
            </div>

            {/* Top badges */}
            <div className="ai-tile-badges">
                {isActive && (
                    <span className="ai-tile-live-badge">
                        <span className="ai-tile-live-dot" />
                        LIVE
                    </span>
                )}
                <span className="ai-tile-ai-badge">AI</span>
            </div>

            {/* Mute indicator */}
            {isMuted && isActive && (
                <div className="ai-tile-muted">
                    <MicOff className="ai-tile-muted-icon" />
                </div>
            )}
        </div>
    );
}
