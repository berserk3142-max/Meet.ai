"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Search, X, ChevronDown } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "upcoming", label: "Upcoming" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "cancelled", label: "Cancelled" },
];

export function MeetingsFilters() {
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
    const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));
    const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => { setSearchInput(search); }, [search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchInput !== search) {
                startTransition(() => { setSearch(searchInput || null); setPage(1); });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchInput, search, setSearch, setPage]);

    const handleStatusChange = (newStatus: string) => {
        startTransition(() => { setStatus(newStatus === "all" ? null : newStatus); setPage(1); });
    };

    const handleClearSearch = () => { setSearchInput(""); setSearch(null); setPage(1); };

    const hasActiveFilters = search || status !== "all";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search meetings by name..."
                        className={cn(
                            "w-full bg-black border-2 border-white/30 text-white placeholder-gray-600 px-4 py-3 pl-10 focus:outline-none focus:border-white transition-colors font-medium",
                            isPending && "opacity-70"
                        )}
                    />
                    {searchInput && (
                        <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="appearance-none bg-black border-2 border-white/30 text-white px-4 py-3 pr-10 min-w-[140px] focus:outline-none focus:border-white font-medium cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-bold uppercase text-xs">Active filters:</span>
                    {search && (
                        <span className="px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] border-2 border-white font-bold text-xs shadow-neo-sm">
                            &quot;{search}&quot;
                        </span>
                    )}
                    {status !== "all" && (
                        <span className="px-2 py-1 bg-[#a3e635]/20 text-[#a3e635] border-2 border-white font-bold text-xs capitalize shadow-neo-sm">
                            {status}
                        </span>
                    )}
                    <button
                        onClick={() => { setSearchInput(""); setSearch(null); setStatus(null); setPage(1); }}
                        className="text-gray-400 hover:text-white transition-colors font-bold text-xs uppercase border-b border-gray-600 hover:border-white"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

interface MeetingsPaginationProps {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export function MeetingsPagination({ total, page, pageSize, totalPages }: MeetingsPaginationProps) {
    const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (newPage: number) => { startTransition(() => { setPage(newPage); }); };

    if (totalPages <= 1) return null;

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
        <div className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t-2 border-white/20",
            isPending && "opacity-70"
        )}>
            <div className="text-sm text-gray-500 font-bold">Showing {startItem}-{endItem} of {total} meetings</div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isPending}
                    className="px-3 py-1.5 text-sm font-bold bg-black text-gray-300 border-2 border-white hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                    Previous
                </button>

                <div className="hidden sm:flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = page - 2 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                disabled={isPending}
                                className={cn(
                                    "w-8 h-8 text-sm font-bold border-2 transition-all",
                                    page === pageNum
                                        ? "bg-[#8B5CF6] text-white border-white shadow-neo-sm"
                                        : "text-gray-400 border-transparent hover:border-white hover:bg-[#111]"
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
                    className="px-3 py-1.5 text-sm font-bold bg-black text-gray-300 border-2 border-white hover:bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
