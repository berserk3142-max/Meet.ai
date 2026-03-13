"use client";

import { Plus } from "lucide-react";

export function MeetingsHeader({ onNew }: { onNew: () => void }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase font-display">
                    My Meetings
                </h1>
                <p className="text-gray-400 font-medium border-l-4 border-[#8B5CF6] pl-3 mt-3">
                    Manage and start your AI-powered meetings.
                </p>
            </div>
            <button
                onClick={onNew}
                className="bg-[#a3e635] text-black font-black text-sm uppercase tracking-wider px-6 py-4 border-[3px] border-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all neo-btn flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                New Meeting
            </button>
        </div>
    );
}
