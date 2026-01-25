export default function AgentsPage() {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-2">AI Agents</h1>
                <p className="text-zinc-400 mb-8">Create and manage your AI meeting assistants.</p>

                {/* Empty State */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No agents yet</h2>
                    <p className="text-zinc-400 mb-6">Create your first AI agent to automate meetings.</p>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20">
                        Create Agent
                    </button>
                </div>
            </div>
        </div>
    );
}
