"use client";

import { trpc } from "@/trpc/client";

/**
 * Client Component Example - Using tRPC with React Query hooks
 * This component demonstrates fetching data in a client component
 */
export default function TRPCClientExample() {
    // Using tRPC query hook - type-safe!
    const { data: user, isLoading, error } = trpc.users.getMe.useQuery();

    // Example mutation
    const updateProfile = trpc.users.updateProfile.useMutation({
        onSuccess: (data) => {
            console.log("Profile updated:", data);
        },
    });

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-zinc-800 rounded mb-4"></div>
                    <div className="h-4 w-64 bg-zinc-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400">Error: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
                tRPC Client Component Example
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Current User</h3>
                <div className="space-y-2">
                    <p className="text-zinc-400">
                        <span className="text-zinc-500">Name:</span> {user?.name}
                    </p>
                    <p className="text-zinc-400">
                        <span className="text-zinc-500">Email:</span> {user?.email}
                    </p>
                    <p className="text-zinc-400">
                        <span className="text-zinc-500">ID:</span>{" "}
                        <code className="text-xs bg-zinc-800 px-2 py-1 rounded">
                            {user?.id}
                        </code>
                    </p>
                </div>
            </div>

            <button
                onClick={() => updateProfile.mutate({ name: "Updated Name" })}
                disabled={updateProfile.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
                {updateProfile.isPending ? "Updating..." : "Test Update Mutation"}
            </button>
        </div>
    );
}
