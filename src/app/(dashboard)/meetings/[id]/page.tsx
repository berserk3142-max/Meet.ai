"use client";

import { use, useState } from "react";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import {
    ArrowLeft,
    Video,
    Clock,
    Calendar,
    Bot,
    FileText,
    MessageSquare,
    Phone,
    Loader2,
    Send,
} from "lucide-react";

interface MeetingDetailPageProps {
    params: Promise<{ id: string }>;
}

const statusStyles: Record<string, string> = {
    upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<"details" | "transcript" | "summary" | "chat">("details");
    const [chatInput, setChatInput] = useState("");

    const { data: meeting, isLoading, error } = trpc.meetings.getById.useQuery({ id });

    const { data: transcriptData } = trpc.meetings.getTranscript.useQuery(
        { id },
        { enabled: activeTab === "transcript" }
    );

    const { data: summaryData } = trpc.meetings.getSummary.useQuery(
        { id },
        { enabled: activeTab === "summary" }
    );

    const { data: chatData, refetch: refetchChat } = trpc.meetings.getChatHistory.useQuery(
        { meetingId: id },
        { enabled: activeTab === "chat" }
    );

    const sendMessage = trpc.meetings.sendChatMessage.useMutation({
        onSuccess: () => {
            setChatInput("");
            refetchChat();
        },
    });

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        sendMessage.mutate({ meetingId: id, message: chatInput });
    };

    if (isLoading) {
        return (
            <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="p-8 lg:p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                        <p className="text-zinc-400 text-lg">Meeting not found</p>
                        <Link href="/meetings" className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                            <ArrowLeft className="w-4 h-4" /> Back to meetings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { key: "details" as const, label: "Details", icon: FileText },
        { key: "transcript" as const, label: "Transcript", icon: FileText },
        { key: "summary" as const, label: "Summary", icon: FileText },
        { key: "chat" as const, label: "Chat", icon: MessageSquare },
    ];

    return (
        <div className="p-8 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back link */}
                <Link
                    href="/meetings"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Meetings
                </Link>

                {/* Header */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-3">{meeting.name}</h1>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusStyles[meeting.status] || statusStyles.upcoming}`}>
                                {meeting.status}
                            </span>
                        </div>
                        {meeting.status === "upcoming" && (
                            <Link
                                href={`/meetings/${id}/call`}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                            >
                                <Phone className="w-4 h-4" />
                                Join Call
                            </Link>
                        )}
                        {meeting.status === "active" && (
                            <Link
                                href={`/meetings/${id}/call`}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium animate-pulse"
                            >
                                <Phone className="w-4 h-4" />
                                Join Call
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                                {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : "-"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                {meeting.startedAt ? new Date(meeting.startedAt).toLocaleTimeString() : "Not started"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Bot className="w-4 h-4" />
                            <span className="text-sm">Agent: {meeting.agentId?.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Video className="w-4 h-4" />
                            <span className="text-sm">
                                {meeting.callId ? `Call: ${meeting.callId.slice(0, 8)}...` : "No call"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                                activeTab === tab.key
                                    ? "bg-purple-600 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    {activeTab === "details" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Meeting Details</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Meeting ID</p>
                                    <p className="font-mono text-sm text-zinc-300">{meeting.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Agent ID</p>
                                    <p className="font-mono text-sm text-zinc-300">{meeting.agentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Created</p>
                                    <p className="text-zinc-300">
                                        {meeting.createdAt ? new Date(meeting.createdAt).toLocaleString() : "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Last Updated</p>
                                    <p className="text-zinc-300">
                                        {meeting.updatedAt ? new Date(meeting.updatedAt).toLocaleString() : "-"}
                                    </p>
                                </div>
                                {meeting.startedAt && (
                                    <div>
                                        <p className="text-sm text-zinc-500 mb-1">Started At</p>
                                        <p className="text-zinc-300">{new Date(meeting.startedAt).toLocaleString()}</p>
                                    </div>
                                )}
                                {meeting.endedAt && (
                                    <div>
                                        <p className="text-sm text-zinc-500 mb-1">Ended At</p>
                                        <p className="text-zinc-300">{new Date(meeting.endedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "transcript" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Transcript</h3>
                            {transcriptData?.hasTranscript ? (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {Array.isArray(transcriptData.transcript)
                                        ? transcriptData.transcript.map((entry: any, i: number) => (
                                            <div key={i} className="border-l-2 border-purple-500/30 pl-4 py-1">
                                                <p className="text-xs font-medium text-purple-400">{entry.speaker || "Speaker"}</p>
                                                <p className="text-zinc-300 text-sm">{entry.text || entry.content}</p>
                                            </div>
                                        ))
                                        : <p className="text-zinc-300 whitespace-pre-wrap">{JSON.stringify(transcriptData.transcript, null, 2)}</p>
                                    }
                                </div>
                            ) : (
                                <p className="text-zinc-500">No transcript available yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === "summary" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Summary</h3>
                            {summaryData?.hasSummary ? (
                                <div className="space-y-4">
                                    {summaryData.summary?.summary && (
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-500 mb-1">Overview</h4>
                                            <p className="text-zinc-300">{summaryData.summary.summary}</p>
                                        </div>
                                    )}
                                    {summaryData.summary?.keyPoints && (
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-500 mb-1">Key Points</h4>
                                            <ul className="list-disc list-inside text-zinc-300 space-y-1">
                                                {summaryData.summary.keyPoints.map((point: string, i: number) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {summaryData.summary?.actionItems && (
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-500 mb-1">Action Items</h4>
                                            <ul className="list-disc list-inside text-zinc-300 space-y-1">
                                                {summaryData.summary.actionItems.map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-zinc-500">No summary available yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Chat with Meeting AI</h3>
                            {meeting.status !== "completed" ? (
                                <p className="text-zinc-500">Chat is available only for completed meetings.</p>
                            ) : (
                                <>
                                    {/* Messages */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {chatData?.messages && chatData.messages.length > 0 ? (
                                            chatData.messages.map((msg: any) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                                                            msg.role === "user"
                                                                ? "bg-purple-600 text-white"
                                                                : "bg-zinc-800 text-zinc-300"
                                                        }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-zinc-500 text-center py-8">
                                                Ask a question about this meeting...
                                            </p>
                                        )}
                                    </div>
                                    {/* Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Ask about this meeting..."
                                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sendMessage.isPending || !chatInput.trim()}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                                        >
                                            {sendMessage.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
