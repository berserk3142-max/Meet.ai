"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    action?: () => void;
    href?: string;
    shortcut?: string;
}

interface CommandGroup {
    heading: string;
    items: CommandItem[];
}

interface CommandDialogProps {
    isOpen: boolean;
    onClose: () => void;
    groups: CommandGroup[];
    placeholder?: string;
}

/**
 * CommandDialog - Keyboard-driven command palette (Ctrl+K / Cmd+K)
 */
export function CommandDialog({
    isOpen,
    onClose,
    groups,
    placeholder = "Type a command or search...",
}: CommandDialogProps) {
    const [search, setSearch] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Filter items based on search
    const filteredGroups = React.useMemo(() => {
        if (!search.trim()) return groups;

        return groups
            .map((group) => ({
                ...group,
                items: group.items.filter(
                    (item) =>
                        item.label.toLowerCase().includes(search.toLowerCase()) ||
                        item.description?.toLowerCase().includes(search.toLowerCase())
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [groups, search]);

    // Flat list of all visible items
    const allItems = React.useMemo(() => {
        return filteredGroups.flatMap((group) => group.items);
    }, [filteredGroups]);

    // Handle keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % allItems.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
                    break;
                case "Enter":
                    e.preventDefault();
                    const selectedItem = allItems[selectedIndex];
                    if (selectedItem) {
                        executeItem(selectedItem);
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, allItems, onClose]);

    // Focus input when opened
    React.useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSearch("");
            setSelectedIndex(0);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Reset selection when search changes
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const executeItem = (item: CommandItem) => {
        if (item.action) {
            item.action();
        } else if (item.href) {
            router.push(item.href);
        }
        onClose();
    };

    if (!isOpen) return null;

    let itemIndex = -1;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Command dialog - responsive */}
            <div className="fixed inset-0 flex items-start justify-center p-4 pt-[20vh] md:pt-[15vh]">
                <div
                    className={cn(
                        "w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden",
                        "animate-in zoom-in-95 fade-in duration-200",
                        "max-h-[60vh] md:max-h-[400px] flex flex-col"
                    )}
                >
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none"
                        />
                        <kbd className="hidden md:inline-flex px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                            ESC
                        </kbd>
                    </div>

                    {/* Command list */}
                    <div className="flex-1 overflow-auto py-2">
                        {filteredGroups.length === 0 ? (
                            <div className="px-4 py-8 text-center text-zinc-500">
                                No results found
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <div key={group.heading}>
                                    <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        {group.heading}
                                    </div>
                                    {group.items.map((item) => {
                                        itemIndex++;
                                        const currentIndex = itemIndex;
                                        const isSelected = selectedIndex === currentIndex;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => executeItem(item)}
                                                onMouseEnter={() => setSelectedIndex(currentIndex)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                                    isSelected ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                                                )}
                                            >
                                                {item.icon && (
                                                    <span className="text-zinc-400">{item.icon}</span>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white">{item.label}</div>
                                                    {item.description && (
                                                        <div className="text-sm text-zinc-500 truncate">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.shortcut && (
                                                    <kbd className="hidden md:inline-flex px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                                                        {item.shortcut}
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700">↑↓</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700">↵</kbd>
                            <span>Select</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to enable global Ctrl+K / Cmd+K shortcut
 */
export function useCommandDialog() {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
    };
}
