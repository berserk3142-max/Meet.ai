import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function HomePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}! 👋
                </h1>
                <p className="text-zinc-400 mb-8">Here&apos;s what&apos;s happening with your meetings today.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-400 text-sm mb-2">Upcoming Meetings</p>
                        <p className="text-3xl font-bold text-white">3</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-400 text-sm mb-2">Active Agents</p>
                        <p className="text-3xl font-bold text-white">2</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-400 text-sm mb-2">Hours Saved</p>
                        <p className="text-3xl font-bold text-white">12</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20">
                            Start Meeting
                        </button>
                        <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all">
                            Create Agent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
