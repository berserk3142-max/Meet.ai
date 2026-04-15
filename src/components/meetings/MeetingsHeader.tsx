"use client";

import { Plus, Video } from "lucide-react";

interface MeetingsHeaderProps {
    onNew: () => void;
}

export function MeetingsHeader({ onNew }: MeetingsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8B5CF6] border-2 border-white flex items-center justify-center shadow-neo">
                    <Video className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight uppercase">
                        Meetings
                    </h1>
                    <p className="text-gray-400 text-sm font-bold mt-2">
                        Manage and review your AI-powered meetings
                    </p>
                </div>
            </div>

            <button
                onClick={onNew}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-[#8B5CF6] text-white font-black text-sm uppercase tracking-wider border-[3px] border-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all neo-btn"
            >
                <Plus className="w-5 h-5" />
                <span>New Meeting</span>
            </button>
        </div>
    );
}
