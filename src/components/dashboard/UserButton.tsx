"use client";

import { useSession, authClient } from "@/lib/auth-client";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import { LogOut, User, CreditCard, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserButton() {
    const { data } = useSession();
    const user = data?.user;
    const router = useRouter();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const getInitials = (name: string | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    const menuItems = [
        { icon: User, label: "Profile", href: "/profile" },
        { icon: CreditCard, label: "Billing", href: "/upgrade" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="relative group">
                    <div className="w-10 h-10 bg-[#8B5CF6] border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-neo-sm hover:shadow-neo transition-all">
                        {getInitials(user.name)}
                    </div>
                </button>
            </SheetTrigger>
            <SheetContent className="w-80 bg-black border-l-[3px] border-white p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>User Menu</SheetTitle>
                    <SheetDescription>Account options and settings</SheetDescription>
                </SheetHeader>

                {/* User Info */}
                <div className="p-6 border-b-[3px] border-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#8B5CF6] border-2 border-white flex items-center justify-center text-white font-black text-lg">
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setOpen(false);
                                router.push(item.href);
                            }}
                            className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-[#8B5CF6] hover:text-white font-bold transition-colors border-2 border-transparent hover:border-white"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Sign Out */}
                <div className="p-4 border-t-[3px] border-white mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-colors border-2 border-transparent hover:border-white"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 text-[10px] text-gray-600 font-mono">
                    Meet.ai v1.0 — Built with ♥
                </div>
            </SheetContent>
        </Sheet>
    );
}
