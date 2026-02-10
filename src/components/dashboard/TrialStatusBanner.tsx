"use client";

import { useState, useEffect } from "react";
import { Sparkles, Crown, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type PlanStatus = "loading" | "free" | "pro" | "error";

export default function TrialStatusBanner() {
    const [planStatus, setPlanStatus] = useState<PlanStatus>("loading");

    useEffect(() => {
        async function checkSubscription() {
            try {
                const { data: customerState } = await authClient.customer.state();

                if (!customerState) {
                    setPlanStatus("free");
                    return;
                }

                // Check if customer has any active subscriptions
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const state = customerState as any;
                const subscriptions = state?.subscriptions ?? state?.activeSubscriptions ?? [];

                if (Array.isArray(subscriptions) && subscriptions.length > 0) {
                    const hasActive = subscriptions.some(
                        (sub: { status?: string }) => sub.status === "active" || sub.status === "trialing"
                    );
                    setPlanStatus(hasActive ? "pro" : "free");
                } else {
                    setPlanStatus("free");
                }
            } catch {
                // User might not be a Polar customer yet
                setPlanStatus("free");
            }
        }

        checkSubscription();
    }, []);

    if (planStatus === "loading") {
        return null; // Don't show anything while loading
    }

    if (planStatus === "pro") {
        return (
            <div className="mx-6 mt-4 mb-2">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">Pro Plan</span>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-zinc-400">All features unlocked</span>
                    </div>
                    <Link
                        href="/upgrade"
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                        Manage Plan
                    </Link>
                </div>
            </div>
        );
    }

    // Free plan — show upgrade prompt
    return (
        <div className="mx-6 mt-4 mb-2">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-rose-600/10 border border-amber-500/20 px-4 py-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Free Plan</p>
                            <p className="text-xs text-zinc-400">Upgrade to unlock unlimited meetings & AI features</p>
                        </div>
                    </div>
                    <Link
                        href="/upgrade"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-amber-500/20"
                    >
                        Upgrade
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
