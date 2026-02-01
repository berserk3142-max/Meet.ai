import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { functions } from "@/lib/inngest.functions";

// Inngest API route - handles all Inngest events
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions,
});
