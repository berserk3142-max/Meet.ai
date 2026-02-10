import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import { CommandProvider } from "@/components/dashboard/CommandProvider";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import TrialStatusBanner from "@/components/dashboard/TrialStatusBanner";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session = null;

    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch (error) {
        // Session retrieval failed - redirect to login
        console.error("Failed to get session:", error);
        redirect("/login");
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <CommandProvider>
            <div className="flex h-screen bg-zinc-950">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardNavbar user={session.user} />
                    <TrialStatusBanner />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </CommandProvider>
    );
}

