"use client";

import { useState } from "react";
import { Check, Sparkles, Crown, Zap, ArrowRight, Shield, Headphones, BarChart3, MessageSquare, Video, Bot, Infinity } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

const PLANS = {
    free: {
        name: "Free",
        description: "Get started with the basics",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            { text: "3 meetings per month", icon: Video },
            { text: "Basic AI summaries", icon: Bot },
            { text: "Transcript access", icon: MessageSquare },
            { text: "Standard support", icon: Headphones },
        ],
    },
    pro: {
        name: "Pro",
        description: "Unlock the full power of Meet.ai",
        monthlyPrice: 19,
        yearlyPrice: 190,
        slug: {
            monthly: "pro-monthly",
            yearly: "pro-yearly",
        },
        features: [
            { text: "Unlimited meetings", icon: Infinity },
            { text: "Advanced AI summaries & insights", icon: Sparkles },
            { text: "AI Chat with transcript", icon: MessageSquare },
            { text: "Recording & playback", icon: Video },
            { text: "Priority support", icon: Shield },
            { text: "Advanced analytics", icon: BarChart3 },
        ],
    },
};

export default function UpgradePage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleCheckout = async (slug: string) => {
        setIsLoading(slug);
        try {
            await authClient.checkout({ slug });
        } catch (error) {
            console.error("Checkout error:", error);
            setIsLoading(null);
        }
    };

    const handlePortal = async () => {
        try {
            await authClient.customer.portal();
        } catch (error) {
            console.error("Portal error:", error);
        }
    };

    const yearlyDiscount = Math.round(
        ((PLANS.pro.monthlyPrice * 12 - PLANS.pro.yearlyPrice) / (PLANS.pro.monthlyPrice * 12)) * 100
    );

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        <Crown className="w-4 h-4" />
                        Pricing Plans
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Upgrade to <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Pro</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto">
                        Unlock unlimited meetings, advanced AI features, and priority support.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <button
                        onClick={() => setBillingPeriod("monthly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            billingPeriod === "monthly"
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod("yearly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
                            billingPeriod === "yearly"
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        Yearly
                        <span className="absolute -top-2 -right-12 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
                            -{yearlyDiscount}%
                        </span>
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-1">{PLANS.free.name}</h3>
                            <p className="text-sm text-zinc-400">{PLANS.free.description}</p>
                        </div>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">$0</span>
                            <span className="text-zinc-500">/month</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {PLANS.free.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <feature.icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                    {feature.text}
                                </li>
                            ))}
                        </ul>
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-zinc-800 text-zinc-400 text-sm font-semibold rounded-xl cursor-not-allowed"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative bg-zinc-900 border-2 border-emerald-500/30 rounded-2xl p-6 flex flex-col">
                        {/* Popular badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
                                ✨ MOST POPULAR
                            </span>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

                        <div className="relative">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                                    {PLANS.pro.name}
                                    <Zap className="w-5 h-5 text-emerald-400" />
                                </h3>
                                <p className="text-sm text-zinc-400">{PLANS.pro.description}</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-4xl font-bold text-white">
                                    ${billingPeriod === "monthly" ? PLANS.pro.monthlyPrice : Math.round(PLANS.pro.yearlyPrice / 12)}
                                </span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            {billingPeriod === "yearly" && (
                                <p className="text-xs text-emerald-400 mb-6">
                                    ${PLANS.pro.yearlyPrice}/year · Save ${PLANS.pro.monthlyPrice * 12 - PLANS.pro.yearlyPrice}
                                </p>
                            )}
                            {billingPeriod === "monthly" && <div className="mb-6" />}
                            <ul className="space-y-3 mb-8 flex-1">
                                {PLANS.pro.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout(PLANS.pro.slug[billingPeriod])}
                                disabled={!!isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Upgrade to Pro
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Comparison */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">Compare Plans</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left text-sm font-medium text-zinc-400 p-4">Feature</th>
                                    <th className="text-center text-sm font-medium text-zinc-400 p-4 w-32">Free</th>
                                    <th className="text-center text-sm font-medium text-emerald-400 p-4 w-32">Pro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {[
                                    ["Meetings per month", "3", "Unlimited"],
                                    ["AI Summaries", "Basic", "Advanced"],
                                    ["Transcript Access", "✓", "✓"],
                                    ["AI Chat with Transcript", "—", "✓"],
                                    ["Recording & Playback", "—", "✓"],
                                    ["Advanced Analytics", "—", "✓"],
                                    ["Priority Support", "—", "✓"],
                                    ["Custom AI Agents", "1", "Unlimited"],
                                ].map(([feature, free, pro], i) => (
                                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="text-sm text-white p-4">{feature}</td>
                                        <td className="text-sm text-zinc-400 text-center p-4">{free}</td>
                                        <td className="text-sm text-emerald-400 text-center p-4 font-medium">{pro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manage Subscription */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-zinc-500 mb-2">Already a Pro subscriber?</p>
                    <button
                        onClick={handlePortal}
                        className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                        Manage your subscription →
                    </button>
                </div>
            </div>
        </div>
    );
}
