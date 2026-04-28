import { currentUser } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";

export default async function ProfilePage() {
    const user = await currentUser();

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1
                    style={{
                        fontSize: "2.25rem",
                        fontWeight: 900,
                        color: "#000000",
                        marginBottom: "0.5rem",
                        fontFamily: "'Lexend', sans-serif",
                    }}
                >
                    Profile
                </h1>
                <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                    Manage your personal information.
                </p>

                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "3px solid #000000",
                        padding: "2rem",
                        boxShadow: "6px 6px 0px 0px #8B5CF6",
                    }}
                >
                    <UserProfile
                        routing="hash"
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                cardBox: "w-full shadow-none border-none",
                                card: "shadow-none border-none",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
