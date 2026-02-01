import { MeetingView } from "@/components/meetings";

export default function MeetingPage({ params }: { params: { id: string } }) {
    return <MeetingView meetingId={params.id} />;
}
