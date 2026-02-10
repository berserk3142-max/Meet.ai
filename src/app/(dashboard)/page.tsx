"use client";

import { trpc } from "@/trpc/client";
import { Video, Bot, Clock, Calendar, CheckCircle2, Zap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const { data, isLoading } = trpc.dashboard.getOverview.useQuery();

    return (
        <div className="p-8">
            <div className="max-w-5xl">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-zinc-400 mb-8">Here&apos;s what&apos;s happening with your meetings.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Meetings"
                        value={data?.totalMeetings}
                        icon={Video}
                        color="emerald"
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Upcoming"
                        value={data?.upcomingMeetings}
                        icon={Calendar}
                        color="blue"
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Active Agents"
                        value={data?.activeAgents}
                        icon={Bot}
                        color="purple"
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Hours Saved"
                        value={data?.hoursSaved}
                        icon={Clock}
                        color="amber"
                        isLoading={isLoading}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-zinc-400">Completed</span>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-600" /> : data?.completedMeetings ?? 0}
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-zinc-400">In Progress</span>
                            <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-600" /> : data?.activeMeetings ?? 0}
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-zinc-400">Total Agents</span>
                            <Bot className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-600" /> : data?.totalAgents ?? 0}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/meetings"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Video className="w-4 h-4" />
                            View Meetings
                        </Link>
                        <Link
                            href="/agents"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all"
                        >
                            <Bot className="w-4 h-4" />
                            Manage Agents
                        </Link>
                        <Link
                            href="/schedule"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    isLoading,
}: {
    label: string;
    value?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: "emerald" | "blue" | "purple" | "amber";
    isLoading: boolean;
}) {
    const colorMap = {
        emerald: {
            bg: "from-emerald-600/10 to-teal-600/10",
            border: "border-emerald-500/20",
            icon: "text-emerald-400",
            glow: "bg-emerald-500/10",
        },
        blue: {
            bg: "from-blue-600/10 to-cyan-600/10",
            border: "border-blue-500/20",
            icon: "text-blue-400",
            glow: "bg-blue-500/10",
        },
        purple: {
            bg: "from-purple-600/10 to-indigo-600/10",
            border: "border-purple-500/20",
            icon: "text-purple-400",
            glow: "bg-purple-500/10",
        },
        amber: {
            bg: "from-amber-600/10 to-orange-600/10",
            border: "border-amber-500/20",
            icon: "text-amber-400",
            glow: "bg-amber-500/10",
        },
    };

    const c = colorMap[color];

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br ${c.bg} border ${c.border} rounded-xl p-5`}>
            <div className={`absolute top-0 right-0 w-16 h-16 ${c.glow} rounded-full blur-2xl`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-zinc-400">{label}</span>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <p className="text-3xl font-bold text-white">
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                    ) : (
                        value ?? 0
                    )}
                </p>
            </div>
        </div>
    );
}
