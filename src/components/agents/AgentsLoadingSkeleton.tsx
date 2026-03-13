export function AgentsLoadingSkeleton() {
    return (
        <div className="border-[3px] border-white bg-black shadow-neo-purple overflow-hidden">
            <div className="p-6">
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-[#111] border-2 border-white"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-[#111] border border-white/20 w-1/3"></div>
                                <div className="h-3 bg-[#111] border border-white/20 w-1/2"></div>
                            </div>
                            <div className="h-6 w-16 bg-[#111] border-2 border-white"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
