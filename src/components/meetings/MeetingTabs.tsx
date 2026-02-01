"use client";

import { useState } from "react";
import { FileText, MessageSquare, Video, Loader2, Copy, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface MeetingTabsProps {
    meetingId: string;
    recordingUrl?: string | null;
}

type TabType = "summary" | "transcript" | "recording";

export function MeetingTabs({ meetingId, recordingUrl }: MeetingTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [copied, setCopied] = useState(false);

    const tabs = [
        { id: "summary" as TabType, label: "Summary", icon: FileText },
        { id: "transcript" as TabType, label: "Transcript", icon: MessageSquare },
        { id: "recording" as TabType, label: "Recording", icon: Video },
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
            <div className="p-6 min-h-[300px]">
                {activeTab === "summary" && (
                    <SummaryTab meetingId={meetingId} onCopy={handleCopy} copied={copied} />
                )}
                {activeTab === "transcript" && (
                    <TranscriptTab meetingId={meetingId} onCopy={handleCopy} copied={copied} />
                )}
                {activeTab === "recording" && (
                    <RecordingTab recordingUrl={recordingUrl} />
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

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => onCopy(JSON.stringify(summary, null, 2))}
                >
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                </Button>
            </div>

            {/* Overview */}
            {summary?.summary && (
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Overview</h3>
                    <p className="text-white leading-relaxed">{summary.summary}</p>
                </div>
            )}

            {/* Key Points */}
            {summary?.keyPoints?.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Key Points</h3>
                    <ul className="space-y-2">
                        {summary.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                                <span className="text-emerald-400 mt-1">•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Items */}
            {summary?.actionItems?.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Action Items</h3>
                    <ul className="space-y-2">
                        {summary.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-white">
                                <span className="text-yellow-400 mt-1">→</span>
                                {item}
                            </li>
                        ))}
                    </ul>
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

    return (
        <div className="space-y-4">
            {/* Actions */}
            <div className="flex justify-end gap-2">
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

            {/* Transcript Content */}
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {isArrayFormat ? (
                    transcript.map((entry: { speaker: string; text: string; time?: string }, i: number) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex-shrink-0">
                                <span className="text-xs text-zinc-500 font-mono">
                                    {entry.time || `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-emerald-400 font-medium text-sm">{entry.speaker}:</span>
                                <p className="text-white mt-1">{entry.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-white whitespace-pre-wrap">{transcript}</p>
                )}
            </div>
        </div>
    );
}

// Recording Tab Component
function RecordingTab({ recordingUrl }: { recordingUrl?: string | null }) {
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
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                    src={recordingUrl}
                    controls
                    className="w-full h-full"
                    poster="/video-poster.jpg"
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Download Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    asChild
                >
                    <a href={recordingUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Recording
                    </a>
                </Button>
            </div>
        </div>
    );
}
