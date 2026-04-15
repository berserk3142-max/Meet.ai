"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function TrialStatusBanner() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div
            className="flex items-center justify-between px-6 py-3"
            style={{
                backgroundColor: "#8B5CF6",
                borderBottom: "3px solid #000000",
            }}
        >
            <div className="flex items-center gap-3">
                <span className="material-icons text-white text-sm">info</span>
                <p className="text-white text-sm font-bold">
                    You&apos;re on the free plan.{" "}
                    <Link
                        href="/upgrade"
                        className="underline font-black hover:text-yellow-300 transition-colors"
                    >
                        Upgrade to Pro →
                    </Link>
                </p>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
