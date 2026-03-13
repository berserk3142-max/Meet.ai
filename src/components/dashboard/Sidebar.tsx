"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserButton from "./UserButton";

const navItems = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Meetings", href: "/meetings", icon: "videocam" },
    { label: "Agents", href: "/agents", icon: "smart_toy" },
    { label: "Schedule", href: "/schedule", icon: "calendar_month" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50"
            style={{
                borderRight: "3px solid #000000",
                backgroundColor: "#ffffff",
            }}
        >
            {/* Logo */}
            <div style={{ padding: "1.5rem", borderBottom: "3px solid #000000" }}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "#8B5CF6",
                            border: "2px solid #000000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "2px 2px 0px 0px #000000",
                        }}
                    >
                        <span className="material-symbols-outlined text-white font-bold">all_inclusive</span>
                    </div>
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 900,
                            letterSpacing: "-0.05em",
                            textTransform: "uppercase",
                            fontFamily: "'Lexend', sans-serif",
                            color: "#000000",
                        }}
                    >
                        Meet.ai
                    </h1>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-4">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center gap-3 p-3 font-bold transition-all"
                            style={
                                isActive
                                    ? {
                                        backgroundColor: "#8B5CF6",
                                        border: "2px solid #000000",
                                        boxShadow: "4px 4px 0px 0px #000000",
                                        color: "#ffffff",
                                    }
                                    : {
                                        border: "2px solid transparent",
                                        color: "#6b7280",
                                    }
                            }
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.border = "2px solid #000000";
                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                    e.currentTarget.style.color = "#000000";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.border = "2px solid transparent";
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#6b7280";
                                }
                            }}
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: "1rem", borderTop: "3px solid #000000" }} className="space-y-2">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 p-2 font-bold text-sm transition-colors"
                    style={{ color: "#374151" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#374151";
                    }}
                >
                    <span className="material-icons" style={{ color: "#8B5CF6" }}>person</span>
                    <span>Profile</span>
                </Link>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 p-2 font-bold text-sm transition-colors"
                    style={{ color: "#374151" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#374151";
                    }}
                >
                    <div
                        style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                        }}
                    >
                        N
                    </div>
                    <span>Settings</span>
                </Link>
                <div className="pt-2">
                    <UserButton />
                </div>
            </div>
        </aside>
    );
}
