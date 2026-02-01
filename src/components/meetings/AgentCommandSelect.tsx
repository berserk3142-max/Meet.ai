"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/trpc/client";
import Link from "next/link";

interface AgentCommandSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function AgentCommandSelect({ value, onChange }: AgentCommandSelectProps) {
    const [open, setOpen] = useState(false);
    // We use the query here as per instructions, but since it's likely cached by the parent page load, it should be instant.
    const { data: agents = [] } = trpc.agents.getAll.useQuery();

    const selectedAgent = agents.find((agent) => agent.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                    {selectedAgent ? selectedAgent.name : "Select an agent..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-zinc-700 bg-zinc-900 text-zinc-300">
                <Command className="bg-zinc-900">
                    <CommandInput placeholder="Search agent..." className="border-b border-zinc-800" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm">
                            <p className="text-zinc-500 mb-2">No agent found.</p>
                            <Link
                                href="/agents"
                                className="text-emerald-500 hover:text-emerald-400 hover:underline text-xs"
                                onClick={() => setOpen(false)}
                            >
                                Create new agent
                            </Link>
                        </CommandEmpty>
                        <CommandGroup>
                            {agents.map((agent) => (
                                <CommandItem
                                    key={agent.id}
                                    value={agent.name} // Command searches by this value
                                    onSelect={() => {
                                        onChange(agent.id);
                                        setOpen(false);
                                    }}
                                    className="data-[selected='true']:bg-zinc-800 data-[selected='true']:text-white"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === agent.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {agent.name}
                                    {agent.status !== "active" && (
                                        <span className="ml-2 text-xs text-zinc-500">({agent.status})</span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <div className="border-t border-zinc-800 p-2">
                        <p className="text-xs text-zinc-500 text-center">
                            Not found? <Link href="/agents" className="text-emerald-500 hover:underline">Create new agent</Link>
                        </p>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
