"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { sidebarItems, bottomItems } from "@/modules/dashboard/sidebar-items";
import { LogOut, Search, Sparkles } from "lucide-react";
import { useCommand } from "./CommandProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const { open: openCommand } = useCommand();

    const handleLogout = async () => {
        await signOut();
        window.location.href = "/login";
    };

    return (
        <aside className="w-64 h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-r border-zinc-800/50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-zinc-800/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <img src="/logo.svg" alt="Meet.ai" className="w-10 h-6 transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                        Meet.ai
                    </span>
                </Link>
            </div>

            {/* Search Button */}
            <div className="p-4 border-b border-zinc-800/50">
                <button
                    onClick={openCommand}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200"
                >
                    <Search className="w-4 h-4" />
                    <span className="flex-1 text-left">Search...</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-500 rounded">⌘K</kbd>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-4">
                    Menu
                </p>
                <ul className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                        }`}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full" />
                                    )}
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-400" : "group-hover:text-emerald-400"}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Upgrade CTA */}
            <div className="p-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10 border border-emerald-500/20 p-4">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
                        </div>
                        <p className="text-xs text-zinc-400 mb-3">
                            Get unlimited meetings & advanced AI features
                        </p>
                        <button className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-zinc-800/50">
                <ul className="space-y-1">
                    {bottomItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full" />
                                    )}
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-400" : "group-hover:text-emerald-400"}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}

                    {/* Logout Button */}
                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
