"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export default function UserButton() {
    return (
        <ClerkUserButton
            appearance={{
                elements: {
                    avatarBox: "w-10 h-10 border-2 border-black shadow-[2px_2px_0px_0px_#000000]",
                    userButtonPopoverCard: "border-2 border-black shadow-[4px_4px_0px_0px_#000000]",
                },
            }}
        />
    );
}
