import { api } from "@/trpc/server";

/**
 * Server Component Example - Using tRPC with server caller
 * This component demonstrates fetching data directly on the server
 */
export default async function TRPCServerExample() {
    // Direct server-side call - no HTTP overhead!
    const caller = await api();

    let user = null;
    let error = null;

    try {
        user = await caller.users.getMe();
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch user";
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400">Note: {error}</p>
                    <p className="text-zinc-500 text-sm mt-2">
                        This is expected if not logged in
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
                tRPC Server Component Example
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Server-side rendered</span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">User Data (SSR)</h3>
                <div className="space-y-2">
                    <p className="text-zinc-400">
                        <span className="text-zinc-500">Name:</span> {user?.name}
                    </p>
                    <p className="text-zinc-400">
                        <span className="text-zinc-500">Email:</span> {user?.email}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                        ✨ This data was fetched on the server before the page loaded.
                        No loading spinner needed!
                    </p>
                </div>
            </div>
        </div>
    );
}
