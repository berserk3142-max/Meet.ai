"use client";

interface RecordingTabProps {
    meeting: any;
}

export default function RecordingTab({ meeting }: RecordingTabProps) {
    if (!meeting.recordingUrl) {
        return (
            <div style={{ textAlign: "center", padding: "3rem" }}>
                <span className="material-icons" style={{ fontSize: "3rem", color: "#d1d5db", display: "block", marginBottom: "1rem" }}>videocam_off</span>
                <p style={{ fontWeight: 700, color: "#000", fontSize: "1.125rem" }}>No recording available</p>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                    {meeting.status === "processing"
                        ? "Recording is being processed and will appear shortly."
                        : meeting.status === "upcoming"
                            ? "Recording will be available after the meeting ends."
                            : "No recording was captured for this meeting."}
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Video Player */}
            <div style={{ border: "3px solid #000", backgroundColor: "#000", boxShadow: "6px 6px 0px 0px #8B5CF6" }}>
                <video
                    controls
                    style={{ width: "100%", display: "block" }}
                    src={meeting.recordingUrl}
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a
                    href={meeting.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.25rem", backgroundColor: "#8B5CF6",
                        color: "#fff", border: "2px solid #000", fontWeight: 700,
                        fontSize: "0.85rem", textDecoration: "none", cursor: "pointer",
                        boxShadow: "3px 3px 0px 0px #000",
                    }}
                >
                    <span className="material-icons" style={{ fontSize: "1.125rem" }}>download</span>
                    Download Recording
                </a>
                <a
                    href={meeting.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.25rem", backgroundColor: "#fff",
                        color: "#000", border: "2px solid #000", fontWeight: 700,
                        fontSize: "0.85rem", textDecoration: "none", cursor: "pointer",
                    }}
                >
                    <span className="material-icons" style={{ fontSize: "1.125rem" }}>open_in_new</span>
                    Open in New Tab
                </a>
            </div>
        </div>
    );
}
