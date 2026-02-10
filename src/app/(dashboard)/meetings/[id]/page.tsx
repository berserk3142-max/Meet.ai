import { MeetingView } from "@/components/meetings";
import { use } from "react";

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <MeetingView meetingId={id} />;
}
