"use client";

export function AgentsLoadingSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-6 w-32 bg-zinc-800 rounded" />
                        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-zinc-800 rounded" />
                        <div className="h-4 w-2/3 bg-zinc-800 rounded" />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <div className="h-8 w-16 bg-zinc-800 rounded" />
                        <div className="h-8 w-16 bg-zinc-800 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
