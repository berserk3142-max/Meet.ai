export default function MeetingsPage() {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-2">Meetings</h1>
                <p className="text-zinc-400 mb-8">Manage your video meetings and recordings.</p>

                {/* Empty State */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No meetings yet</h2>
                    <p className="text-zinc-400 mb-6">Start your first meeting to see it here.</p>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20">
                        Start Meeting
                    </button>
                </div>
            </div>
        </div>
    );
}
