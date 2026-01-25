import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If logged in, show dashboard
  if (session) {
    return (
      <div className="flex h-screen bg-zinc-950">
        {/* Import Sidebar dynamically */}
        <aside className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-6 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Meet.ai" className="w-10 h-6" />
              <span className="text-xl font-bold text-white">Meet.ai</span>
            </Link>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li><Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30">🏠 Home</Link></li>
              <li><Link href="/meetings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">📹 Meetings</Link></li>
              <li><Link href="/agents" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">🤖 Agents</Link></li>
              <li><Link href="/schedule" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">📅 Schedule</Link></li>
            </ul>
          </nav>
          <div className="p-4 border-t border-zinc-800">
            <ul className="space-y-2">
              <li><Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">👤 Profile</Link></li>
              <li><Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">⚙️ Settings</Link></li>
            </ul>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {session.user.name}! 👋
            </h1>
            <p className="text-zinc-400 mb-8">Here&apos;s what&apos;s happening with your meetings today.</p>

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

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                  Start Meeting
                </button>
                <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all">
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Meet.ai" className="w-14 h-10" />
            <span className="text-4xl font-bold text-white">Meet.ai</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4">
          AI-Powered Video Meetings
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          Create intelligent AI agents to automate your meetings, take notes, and boost productivity.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
