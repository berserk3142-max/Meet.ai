"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Search, Filter, X } from "lucide-react";
import { useEffect, useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
];

interface AgentsFiltersProps {
    onFiltersChange?: (filters: { search: string; status: string; page: number }) => void;
}

/**
 * AgentsFilters - URL-synced search and filters using NUQS
 */
export function AgentsFilters({ onFiltersChange }: AgentsFiltersProps) {
    const [isPending, startTransition] = useTransition();

    // URL state with NUQS
    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    // Local state for debounced search
    const [searchInput, setSearchInput] = useState(search);

    // Sync local input with URL state on mount
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchInput !== search) {
                startTransition(() => {
                    setSearch(searchInput || null);
                    setPage(1); // Reset to page 1 on search
                });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchInput, search, setSearch, setPage]);

    // Notify parent of filter changes
    useEffect(() => {
        onFiltersChange?.({ search, status, page });
    }, [search, status, page, onFiltersChange]);

    const handleStatusChange = (newStatus: string) => {
        startTransition(() => {
            setStatus(newStatus === "all" ? null : newStatus);
            setPage(1); // Reset to page 1 on status change
        });
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch(null);
        setPage(1);
    };

    const hasActiveFilters = search || status !== "all";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search agents by name..."
                        className={cn(
                            "w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors",
                            isPending && "opacity-70"
                        )}
                    />
                    {searchInput && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">Active filters:</span>
                    {search && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded border border-blue-500/30">
                            &quot;{search}&quot;
                        </span>
                    )}
                    {status !== "all" && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded border border-purple-500/30 capitalize">
                            {status}
                        </span>
                    )}
                    <button
                        onClick={() => {
                            setSearchInput("");
                            setSearch(null);
                            setStatus(null);
                            setPage(1);
                        }}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * AgentsPagination - URL-synced pagination controls
 */
interface AgentsPaginationProps {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export function AgentsPagination({ total, page, pageSize, totalPages }: AgentsPaginationProps) {
    const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (newPage: number) => {
        startTransition(() => {
            setPage(newPage);
        });
    };

    if (totalPages <= 1) return null;

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
        <div className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-zinc-800",
            isPending && "opacity-70"
        )}>
            <div className="text-sm text-zinc-500">
                Showing {startItem}-{endItem} of {total} agents
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1 || isPending}
                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    First
                </button>
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isPending}
                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                disabled={isPending}
                                className={cn(
                                    "w-8 h-8 text-sm rounded transition-colors",
                                    page === pageNum
                                        ? "bg-blue-600 text-white"
                                        : "text-zinc-400 hover:bg-zinc-800"
                                )}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || isPending}
                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages || isPending}
                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Last
                </button>
            </div>
        </div>
    );
}
