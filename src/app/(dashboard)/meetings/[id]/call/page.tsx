import { api } from "@/trpc/server";
import { CallView } from "@/components/call";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CallPageProps {
    params: { id: string };
}

export default async function CallPage({ params }: CallPageProps) {
    const trpc = await api();
    const meeting = await trpc.meetings.getById({ id: params.id });

    if (!meeting) {
        redirect("/meetings");
    }

    // If no callId, redirect back to meeting
    if (!meeting.callId) {
        redirect(`/meetings/${params.id}`);
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-zinc-400 text-sm">
                    <Link
                        href={`/meetings/${params.id}`}
                        className="hover:text-white transition-colors flex items-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to meeting
                    </Link>
                    <span className="text-zinc-600">/</span>
                    <span className="text-zinc-200">{meeting.name}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-emerald-400 font-medium">Video Call</span>
                </div>
            </div>

            {/* Call View */}
            <CallView meetingId={params.id} callId={meeting.callId} />
        </div>
    );
}
