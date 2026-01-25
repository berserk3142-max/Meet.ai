import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
                <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                            <span className="text-zinc-300">Name</span>
                            <span className="text-zinc-400">{session.user.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                            <span className="text-zinc-300">Email</span>
                            <span className="text-zinc-400">{session.user.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
