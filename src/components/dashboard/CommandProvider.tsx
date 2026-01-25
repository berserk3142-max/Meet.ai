"use client";

import * as React from "react";
import { CommandDialog, useCommandDialog } from "@/components/ui/command-dialog";
import { Home, Video, Bot, Calendar, Settings, User, Plus, Search } from "lucide-react";

// Define navigation commands
const commandGroups = [
    {
        heading: "Navigation",
        items: [
            {
                id: "home",
                label: "Home",
                description: "Go to dashboard",
                icon: <Home className="w-4 h-4" />,
                href: "/",
                shortcut: "G H",
            },
            {
                id: "meetings",
                label: "Meetings",
                description: "View all meetings",
                icon: <Video className="w-4 h-4" />,
                href: "/meetings",
                shortcut: "G M",
            },
            {
                id: "agents",
                label: "Agents",
                description: "Manage AI agents",
                icon: <Bot className="w-4 h-4" />,
                href: "/agents",
                shortcut: "G A",
            },
            {
                id: "schedule",
                label: "Schedule",
                description: "View calendar",
                icon: <Calendar className="w-4 h-4" />,
                href: "/schedule",
            },
        ],
    },
    {
        heading: "Actions",
        items: [
            {
                id: "create-agent",
                label: "Create Agent",
                description: "Create a new AI agent",
                icon: <Plus className="w-4 h-4" />,
                href: "/agents?create=true",
            },
            {
                id: "create-meeting",
                label: "Create Meeting",
                description: "Schedule a new meeting",
                icon: <Plus className="w-4 h-4" />,
                href: "/meetings?create=true",
            },
        ],
    },
    {
        heading: "Settings",
        items: [
            {
                id: "profile",
                label: "Profile",
                description: "Edit your profile",
                icon: <User className="w-4 h-4" />,
                href: "/profile",
            },
            {
                id: "settings",
                label: "Settings",
                description: "App settings",
                icon: <Settings className="w-4 h-4" />,
                href: "/settings",
            },
        ],
    },
];

interface CommandProviderProps {
    children: React.ReactNode;
}

interface CommandContextType {
    open: () => void;
    close: () => void;
    isOpen: boolean;
}

const CommandContext = React.createContext<CommandContextType | null>(null);

export function useCommand() {
    const context = React.useContext(CommandContext);
    if (!context) {
        throw new Error("useCommand must be used within CommandProvider");
    }
    return context;
}

/**
 * CommandProvider - Provides global command palette with Ctrl+K
 */
export function CommandProvider({ children }: CommandProviderProps) {
    const { isOpen, open, close } = useCommandDialog();

    return (
        <CommandContext.Provider value={{ isOpen, open, close }}>
            {children}
            <CommandDialog
                isOpen={isOpen}
                onClose={close}
                groups={commandGroups}
                placeholder="Search pages, commands..."
            />
        </CommandContext.Provider>
    );
}

/**
 * SearchButton - Trigger button for command palette
 */
export function SearchButton({ className }: { className?: string }) {
    const { open } = useCommand();

    return (
        <button
            onClick={open}
            className={`flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${className}`}
        >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">
                ⌘K
            </kbd>
        </button>
    );
}
