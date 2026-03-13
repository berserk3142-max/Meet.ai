"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserButton from "./UserButton";

export default function DashboardNavbar() {
    return (
        <header className="h-16 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50 px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Search meetings, agents..."
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-700/50 rounded border border-zinc-600/50">
                            ⌘
                        </kbd>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-700/50 rounded border border-zinc-600/50">
                            K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-4">
                {/* Notifications */}
                <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                </button>

                {/* User Button */}
                <UserButton />
            </div>
        </header>
    );
}
