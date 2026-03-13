import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { CommandProvider } from "@/components/dashboard/CommandProvider";
import TrialStatusBanner from "@/components/dashboard/TrialStatusBanner";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <CommandProvider>
            <div className="flex min-h-screen" style={{ backgroundColor: "#f3f4f6", color: "#111827" }}>
                <Sidebar />
                <main className="ml-64 flex-1 min-h-screen overflow-y-auto relative" style={{ backgroundColor: "#f3f4f6" }}>
                    {/* Dot pattern overlay */}
                    <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            opacity: 0.08,
                            backgroundImage: "radial-gradient(#8B5CF6 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    ></div>
                    <div className="relative z-10">
                        <TrialStatusBanner />
                        {children}
                    </div>
                </main>
            </div>
        </CommandProvider>
    );
}
