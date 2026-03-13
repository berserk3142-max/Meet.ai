"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function TrialStatusBanner() {
    const { data: session, isPending } = useSession();

    if (isPending || !session) return null;

    const isProPlan = (session.user as any)?.plan === "pro";

    if (isProPlan) {
        return (
            <div className="mx-8 mt-6 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[#a3e635] text-[#a3e635] text-xs font-bold uppercase tracking-wider">
                    <span className="material-icons text-sm">verified</span>
                    Pro Plan Active
                </div>
            </div>
        );
    }

    return (
        <div className="mx-8 mt-6 mb-2">
            <div className="border-[3px] border-white bg-[#EAB308] text-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-neo-purple">
                <div className="flex items-center gap-3">
                    <span className="material-icons text-2xl">rocket_launch</span>
                    <div>
                        <p className="font-black text-sm uppercase">Free Plan</p>
                        <p className="text-xs font-medium opacity-80">Upgrade to unlock unlimited meetings.</p>
                    </div>
                </div>
                <Link
                    href="/upgrade"
                    className="bg-black text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-800 hover:scale-105 transition-transform whitespace-nowrap border-2 border-transparent hover:border-white"
                >
                    Upgrade Plan →
                </Link>
            </div>
        </div>
    );
}
