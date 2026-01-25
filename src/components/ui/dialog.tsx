"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Dialog Component - Desktop centered modal
 */
export function Dialog({ isOpen, onClose, children, className }: DialogProps) {
    // Handle ESC key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dialog container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={cn(
                        "relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md",
                        "animate-in zoom-in-95 fade-in duration-200",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                        aria-label="Close dialog"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function DialogContent({ children, className }: DialogContentProps) {
    return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    return <h2 className={cn("text-xl font-bold text-white", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
    return <p className={cn("text-sm text-zinc-400 mt-1", className)}>{children}</p>;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
    return <div className={cn("flex gap-3 mt-6", className)}>{children}</div>;
}
