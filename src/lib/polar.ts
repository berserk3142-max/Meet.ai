import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    // Use 'sandbox' for development, 'production' for live
    server: (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "sandbox",
});
