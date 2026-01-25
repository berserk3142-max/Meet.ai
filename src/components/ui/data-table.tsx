"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

// Column definition type
export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    render?: (item: T, index: number) => React.ReactNode;
}

// DataTable props
interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    emptyState?: React.ReactNode;
    onRowClick?: (item: T) => void;
    getRowKey: (item: T) => string;
}

type SortDirection = "asc" | "desc" | null;

/**
 * DataTable - Reusable table with pagination, sorting, and search
 */
export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    pageSize = 10,
    searchable = false,
    searchPlaceholder = "Search...",
    searchKeys = [],
    emptyState,
    onRowClick,
    getRowKey,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [sortKey, setSortKey] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter data based on search
    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim() || searchKeys.length === 0) return data;

        const query = searchQuery.toLowerCase();
        return data.filter((item) =>
            searchKeys.some((key) => {
                const value = item[key];
                return String(value).toLowerCase().includes(query);
            })
        );
    }, [data, searchQuery, searchKeys]);

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortKey || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [filteredData, sortKey, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Reset to first page when data or search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, data.length]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortKey(null);
                setSortDirection(null);
            }
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const getSortIcon = (key: string) => {
        if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 text-zinc-500" />;
        if (sortDirection === "asc") return <ArrowUp className="w-4 h-4 text-blue-400" />;
        return <ArrowDown className="w-4 h-4 text-blue-400" />;
    };

    // Empty state
    if (data.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <div className="space-y-4">
            {/* Search bar */}
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            )}

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={cn(
                                            "px-4 py-3 text-left text-sm font-semibold text-zinc-400",
                                            column.sortable && "cursor-pointer hover:text-white transition-colors",
                                            column.width
                                        )}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{column.header}</span>
                                            {column.sortable && getSortIcon(column.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500">
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={getRowKey(item)}
                                        onClick={() => onRowClick?.(item)}
                                        className={cn(
                                            "border-b border-zinc-800 last:border-0",
                                            onRowClick && "cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                        )}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={cn("px-4 py-4 text-sm text-zinc-300", column.width)}
                                            >
                                                {column.render
                                                    ? column.render(item, startIndex + index)
                                                    : String(item[column.key] ?? "-")}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                        <div className="text-sm text-zinc-500">
                            Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-400" />
                            </button>

                            <div className="flex items-center gap-1 px-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={cn(
                                                "w-8 h-8 text-sm rounded transition-colors",
                                                currentPage === pageNum
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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
