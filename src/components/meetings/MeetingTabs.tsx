"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileText, MessageSquare, Video, Loader2, Copy, Download, CheckCircle2, Users, ChevronDown, Search, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface MeetingTabsProps {
    meetingId: string;
    recordingUrl?: string | null;
}

type TabType = "summary" | "transcript" | "recording" | "chat";

export function MeetingTabs({ meetingId, recordingUrl }: MeetingTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [copied, setCopied] = useState(false);

    const tabs = [
        { id: "summary" as TabType, label: "Summary", icon: FileText },
        { id: "transcript" as TabType, label: "Transcript", icon: MessageSquare },
        { id: "recording" as TabType, label: "Recording", icon: Video },
        { id: "chat" as TabType, label: "Chat", icon: Sparkles },
    ];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors",
                            activeTab === tab.id
                                ? "text-white bg-zinc-800/50 border-b-2 border-emerald-500"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={cn("min-h-[300px]", activeTab === "chat" ? "p-0" : "p-6")}>
                {activeTab === "summary" && (
                    <SummaryTab meetingId={meetingId} onCopy={handleCopy} copied={copied} />
                )}
                {activeTab === "transcript" && (
                    <TranscriptTab meetingId={meetingId} onCopy={handleCopy} copied={copied} />
                )}
                {activeTab === "recording" && (
                    <RecordingTab recordingUrl={recordingUrl} />
                )}
                {activeTab === "chat" && (
                    <ChatTab meetingId={meetingId} />
                )}
            </div>
        </div>
    );
}

// Summary Tab Component
function SummaryTab({
    meetingId,
    onCopy,
    copied
}: {
    meetingId: string;
    onCopy: (text: string) => void;
    copied: boolean;
}) {
    const { data, isLoading, error } = trpc.meetings.getSummary.useQuery({ id: meetingId });
    const [showNotes, setShowNotes] = useState(false);
    const [expandedSpeakers, setExpandedSpeakers] = useState<number[]>([]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (error || !data?.hasSummary) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Summary not yet available</p>
                <p className="text-zinc-500 text-sm mt-2">
                    The AI is still processing this meeting or no summary was generated.
                </p>
            </div>
        );
    }

    const summary = data.summary;

    // Sentiment badge styling
    const getSentimentStyle = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "bg-green-500/10 text-green-400 border-green-500/30";
            case "negative":
                return "bg-red-500/10 text-red-400 border-red-500/30";
            default:
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "😊";
            case "negative":
                return "😔";
            default:
                return "😐";
        }
    };

    const toggleSpeaker = (index: number) => {
        setExpandedSpeakers(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Sentiment Badge & Actions */}
            <div className="flex items-center justify-between">
                {/* Sentiment Badge */}
                {summary?.sentiment && (
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
                        getSentimentStyle(summary.sentiment.overall)
                    )}>
                        <span>{getSentimentIcon(summary.sentiment.overall)}</span>
                        <span className="capitalize">{summary.sentiment.overall} Tone</span>
                        {summary.sentiment.confidence > 0 && (
                            <span className="text-xs opacity-70">
                                ({Math.round(summary.sentiment.confidence * 100)}%)
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => onCopy(JSON.stringify(summary, null, 2))}
                >
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy All"}
                </Button>
            </div>

            {/* Overview */}
            {summary?.summary && (
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
                    <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Overview
                    </h3>
                    <p className="text-white leading-relaxed">{summary.summary}</p>
                </div>
            )}

            {/* Key Points & Decisions Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Key Points */}
                {summary?.keyPoints?.length > 0 && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</span>
                            Key Points
                        </h3>
                        <ul className="space-y-2">
                            {summary.keyPoints.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-white text-sm">
                                    <span className="text-emerald-400 mt-0.5">•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Decisions Made */}
                {summary?.decisonsMade?.length > 0 && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">⚡</span>
                            Decisions Made
                        </h3>
                        <ul className="space-y-2">
                            {summary.decisonsMade.map((decision: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-white text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <span>{decision}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Action Items */}
            {summary?.actionItems?.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-lg p-4 border border-yellow-500/20">
                    <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center text-xs">📋</span>
                        Action Items ({summary.actionItems.length})
                    </h3>
                    <ul className="space-y-2">
                        {summary.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-white text-sm bg-zinc-900/50 rounded-md p-2">
                                <span className="text-yellow-400 mt-0.5">→</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Speaker Highlights */}
            {summary?.speakerHighlights?.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Speaker Highlights
                    </h3>
                    <div className="space-y-2">
                        {summary.speakerHighlights.map((speaker: { speaker: string; mainPoints: string[] }, i: number) => (
                            <div
                                key={i}
                                className="bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleSpeaker(i)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {speaker.speaker.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-medium text-white">{speaker.speaker}</span>
                                        <span className="text-xs text-zinc-500">
                                            {speaker.mainPoints.length} points
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 text-zinc-400 transition-transform",
                                        expandedSpeakers.includes(i) && "rotate-180"
                                    )} />
                                </button>
                                {expandedSpeakers.includes(i) && (
                                    <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50">
                                        <ul className="space-y-1.5 ml-11">
                                            {speaker.mainPoints.map((point: string, j: number) => (
                                                <li key={j} className="text-sm text-zinc-300 flex items-start gap-2">
                                                    <span className="text-purple-400">•</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meeting Notes (Collapsible) */}
            {summary?.meetingNotes && (
                <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                    >
                        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Meeting Notes
                        </h3>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-zinc-400 transition-transform",
                            showNotes && "rotate-180"
                        )} />
                    </button>
                    {showNotes && (
                        <div className="p-4 pt-0 border-t border-zinc-800/50">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
                                    {summary.meetingNotes}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Transcript Tab Component
function TranscriptTab({
    meetingId,
    onCopy,
    copied
}: {
    meetingId: string;
    onCopy: (text: string) => void;
    copied: boolean;
}) {
    const { data, isLoading, error } = trpc.meetings.getTranscript.useQuery({ id: meetingId });
    const [searchQuery, setSearchQuery] = useState("");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (error || !data?.hasTranscript) {
        return (
            <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Transcript not yet available</p>
                <p className="text-zinc-500 text-sm mt-2">
                    The transcription is still being processed.
                </p>
            </div>
        );
    }

    const transcript = data.transcript;
    const isArrayFormat = Array.isArray(transcript);

    // Filter transcript entries based on search query
    const filteredTranscript = isArrayFormat && searchQuery.trim()
        ? transcript.filter((entry: { text: string; speaker: string }) =>
            entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.speaker.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : transcript;

    // Highlight search matches in text
    const highlightText = (text: string) => {
        if (!searchQuery.trim()) return text;

        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Copy Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => onCopy(typeof transcript === 'string' ? transcript : JSON.stringify(transcript, null, 2))}
                >
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                </Button>
            </div>

            {/* Search Results Info */}
            {isArrayFormat && searchQuery && (
                <p className="text-xs text-zinc-500">
                    Showing {filteredTranscript.length} of {transcript.length} entries
                </p>
            )}

            {/* Transcript Content */}
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {isArrayFormat ? (
                    filteredTranscript.length > 0 ? (
                        filteredTranscript.map((entry: { speaker: string; text: string; time?: string }, i: number) => (
                            <div key={i} className="flex gap-3 bg-zinc-900/30 rounded-lg p-3 border border-zinc-800/50">
                                <div className="flex-shrink-0">
                                    <span className="text-xs text-zinc-500 font-mono bg-zinc-800 px-2 py-1 rounded">
                                        {entry.time || `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-emerald-400 font-medium text-sm">
                                        {highlightText(entry.speaker)}:
                                    </span>
                                    <p className="text-white mt-1 text-sm leading-relaxed">
                                        {highlightText(entry.text)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">No matches found for "{searchQuery}"</p>
                        </div>
                    )
                ) : (
                    <p className="text-white whitespace-pre-wrap">{transcript}</p>
                )}
            </div>
        </div>
    );
}

// Recording Tab Component
function RecordingTab({ recordingUrl }: { recordingUrl?: string | null }) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!recordingUrl) {
        return (
            <div className="text-center py-12">
                <Video className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Recording not available</p>
                <p className="text-zinc-500 text-sm mt-2">
                    No recording was made for this meeting or it's still being processed.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800">
                <video
                    ref={videoRef}
                    src={recordingUrl}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Playback Controls Bar */}
            <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50">
                {/* Time Display */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                        {formatTime(currentTime)} / {formatTime(duration || 0)}
                    </span>
                </div>

                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Speed:</span>
                    <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                        {playbackSpeeds.map((speed) => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={cn(
                                    "px-2 py-1 text-xs rounded-md transition-colors",
                                    playbackSpeed === speed
                                        ? "bg-emerald-600 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                                )}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Download Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    asChild
                >
                    <a href={recordingUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </a>
                </Button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT TAB — AI-powered meeting Q&A
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
    "What were the main action items?",
    "Summarize the key decisions made",
    "What did each speaker contribute?",
    "Were there any disagreements or concerns?",
    "What are the next steps?",
];

function ChatTab({ meetingId }: { meetingId: string }) {
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const utils = trpc.useUtils();

    // Fetch chat history
    const { data: chatData, isLoading: isLoadingHistory } = trpc.meetings.getChatHistory.useQuery(
        { meetingId },
        { refetchOnWindowFocus: false }
    );

    // Send message mutation
    const sendMessage = trpc.meetings.sendChatMessage.useMutation({
        onMutate: () => {
            setIsThinking(true);
            setError(null);
        },
        onSuccess: () => {
            setIsThinking(false);
            // Refresh chat history to show both user + assistant messages
            utils.meetings.getChatHistory.invalidate({ meetingId });
        },
        onError: (err) => {
            setIsThinking(false);
            setError(err.message || "Failed to get AI response. Please try again.");
        },
    });

    const messages = chatData?.messages || [];

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isThinking) return;

        setInput("");
        sendMessage.mutate({ meetingId, message: trimmed });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput("");
        sendMessage.mutate({ meetingId, message: question });
    };

    // Loading state
    if (isLoadingHistory) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && !isThinking ? (
                    // Empty state with suggested questions
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">Ask about this meeting</h3>
                        <p className="text-zinc-500 text-sm text-center max-w-sm mb-6">
                            I have full context of your meeting transcript. Ask me anything!
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {SUGGESTED_QUESTIONS.map((question, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestedQuestion(question)}
                                    className="px-3 py-1.5 text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full border border-zinc-700/50 hover:border-emerald-500/30 transition-all"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Message list
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-emerald-400" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-emerald-600 text-white rounded-br-md"
                                            : "bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-bl-md"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <span className={cn(
                                        "text-[10px] mt-1 block",
                                        msg.role === "user" ? "text-emerald-200/60 text-right" : "text-zinc-500"
                                    )}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {msg.role === "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                        <User className="w-4 h-4 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* AI thinking indicator */}
                        {isThinking && (
                            <div className="flex gap-3 justify-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="bg-zinc-800 border border-zinc-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-sm text-red-400">
                                    {error}
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-2 text-red-300 hover:text-white underline"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask anything about this meeting..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isThinking}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-10 disabled:opacity-50"
                    >
                        {isThinking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 text-center">
                    AI responses are based on this meeting&apos;s transcript and may not be 100% accurate.
                </p>
            </div>
        </div>
    );
}

