import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
                <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6">
                    <p className="text-zinc-300 mb-4">Welcome back, <span className="text-blue-400 font-semibold">{session.user.name}</span>!</p>
                    <p className="text-zinc-400">Email: {session.user.email}</p>
                </div>
            </div>
        </div>
    );
}
