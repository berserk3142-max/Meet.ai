import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="w-full max-w-md px-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.svg"
                            alt="Meet.ai Logo"
                            className="w-14 h-10"
                        />
                        <span className="text-3xl font-bold text-white">Meet.ai</span>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8 shadow-2xl">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-zinc-500 text-sm mt-6">
                    © 2026 Meet.ai. All rights reserved.
                </p>
            </div>
        </div>
    );
}
