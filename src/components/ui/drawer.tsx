"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    side?: "bottom" | "left" | "right";
    className?: string;
}

interface DrawerContentProps {
    children: React.ReactNode;
    className?: string;
}

interface DrawerHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface DrawerTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface DrawerDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

interface DrawerFooterProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Drawer Component - Mobile bottom/side sheet
 */
export function Drawer({ isOpen, onClose, children, side = "bottom", className }: DrawerProps) {
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

    const sideStyles = {
        bottom: "inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-300 rounded-t-2xl max-h-[90vh]",
        left: "inset-y-0 left-0 animate-in slide-in-from-left duration-300 w-80 max-w-[80vw]",
        right: "inset-y-0 right-0 animate-in slide-in-from-right duration-300 w-80 max-w-[80vw]",
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    "fixed bg-zinc-900 border-zinc-800 shadow-2xl overflow-auto",
                    side === "bottom" ? "border-t" : "border-l",
                    sideStyles[side],
                    className
                )}
            >
                {/* Handle bar for bottom drawer */}
                {side === "bottom" && (
                    <div className="flex justify-center py-2">
                        <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                    aria-label="Close drawer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {children}
            </div>
        </div>
    );
}

export function DrawerContent({ children, className }: DrawerContentProps) {
    return <div className={cn("p-6 pt-2", className)}>{children}</div>;
}

export function DrawerHeader({ children, className }: DrawerHeaderProps) {
    return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DrawerTitle({ children, className }: DrawerTitleProps) {
    return <h2 className={cn("text-xl font-bold text-white", className)}>{children}</h2>;
}

export function DrawerDescription({ children, className }: DrawerDescriptionProps) {
    return <p className={cn("text-sm text-zinc-400 mt-1", className)}>{children}</p>;
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
    return <div className={cn("flex gap-3 mt-6", className)}>{children}</div>;
}
