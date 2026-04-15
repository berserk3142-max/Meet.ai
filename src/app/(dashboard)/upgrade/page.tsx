"use client";

import { useState } from "react";
import { Sparkles, Check, Zap, Crown, Loader2 } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Get started with basic features",
        features: [
            "5 meetings per month",
            "Basic AI summaries",
            "1 agent",
            "Community support",
        ],
        current: true,
    },
    {
        name: "Pro Monthly",
        slug: "pro-monthly",
        price: "$19",
        period: "/month",
        description: "For professionals who need more",
        features: [
            "Unlimited meetings",
            "Advanced AI summaries & transcripts",
            "Unlimited agents",
            "Chat with meeting AI",
            "Priority support",
            "Custom agent instructions",
        ],
        popular: true,
    },
    {
        name: "Pro Yearly",
        slug: "pro-yearly",
        price: "$190",
        period: "/year",
        description: "Save 17% with annual billing",
        features: [
            "Everything in Pro Monthly",
            "2 months free",
            "Early access to new features",
            "Dedicated support",
        ],
    },
];

export default function UpgradePage() {
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

    const handleUpgrade = async (slug: string) => {
        setIsUpgrading(slug);
        // TODO: Integrate with Polar checkout
        // The auth.ts already has Polar checkout configured
        try {
            // Placeholder - would call the Polar checkout API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert("Polar checkout integration needed. Configure your Polar product IDs in src/lib/auth.ts");
        } finally {
            setIsUpgrading(null);
        }
    };

    return (
        <div className="p-8 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        Upgrade Your Plan
                    </div>
                    <h1 className="text-4xl font-bold text-white">
                        Choose the right plan for you
                    </h1>
                    <p className="text-zinc-400 max-w-lg mx-auto">
                        Unlock the full power of Meet.ai with advanced AI features, unlimited meetings, and priority support.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-zinc-900 border rounded-2xl p-8 flex flex-col ${
                                plan.popular
                                    ? "border-purple-500 shadow-lg shadow-purple-500/10"
                                    : "border-zinc-800"
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                    <Crown className="w-3 h-3" />
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-zinc-500 text-sm">{plan.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.current ? (
                                <button
                                    disabled
                                    className="w-full py-3 px-4 bg-zinc-800 text-zinc-400 rounded-xl font-medium cursor-default"
                                >
                                    Current Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => plan.slug && handleUpgrade(plan.slug)}
                                    disabled={isUpgrading === plan.slug}
                                    className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                                        plan.popular
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-zinc-800 hover:bg-zinc-700 text-white"
                                    }`}
                                >
                                    {isUpgrading === plan.slug ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Upgrade
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
