import { currentUser } from "@clerk/nextjs/server";

export default async function SettingsPage() {
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
                    Settings
                </h1>
                <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                    Manage your account and preferences.
                </p>

                {/* Account Settings */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "3px solid #000000",
                        padding: "1.5rem",
                        boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.15)",
                        marginBottom: "1.5rem",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#000000",
                            marginBottom: "1rem",
                            fontFamily: "'Lexend', sans-serif",
                        }}
                    >
                        Account
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem 0",
                                borderBottom: "2px solid #e5e7eb",
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, color: "#000000" }}>Email</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    {user?.emailAddresses[0]?.emailAddress}
                                </p>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem 0",
                                borderBottom: "2px solid #e5e7eb",
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, color: "#000000" }}>Name</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        border: "3px solid #000000",
                        padding: "1.5rem",
                        boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.15)",
                        marginBottom: "1.5rem",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#000000",
                            marginBottom: "1rem",
                            fontFamily: "'Lexend', sans-serif",
                        }}
                    >
                        Preferences
                    </h2>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem 0",
                        }}
                    >
                        <div>
                            <p style={{ fontWeight: 600, color: "#000000" }}>Email Notifications</p>
                            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                Receive email updates about meetings
                            </p>
                        </div>
                        <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                        </label>
                    </div>
                </div>

                {/* Info Note */}
                <div
                    style={{
                        backgroundColor: "#fef3c7",
                        border: "3px solid #000000",
                        padding: "1.5rem",
                        boxShadow: "6px 6px 0px 0px #f59e0b",
                    }}
                >
                    <p style={{ fontWeight: 700, color: "#000000", marginBottom: "0.25rem" }}>
                        💡 Account Management
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
                        To update your password, manage connected accounts, or delete your account, visit your{" "}
                        <a href="/profile" style={{ color: "#8B5CF6", fontWeight: 700, textDecoration: "underline" }}>
                            Profile page
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
