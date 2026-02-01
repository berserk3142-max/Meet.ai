export function MeetingsHeader({ onNew }: { onNew: () => void }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Meetings</h1>
                <p className="text-zinc-400">View and manage all your meetings in one place.</p>
            </div>
            <button
                onClick={onNew}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
                <span className="text-xl leading-none">+</span>
                New Meeting
            </button>
        </div>
    );
}
