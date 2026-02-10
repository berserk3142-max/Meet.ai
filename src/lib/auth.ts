import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/schema";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { polarClient } from "./polar";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [
        polar({
            client: polarClient,
            // Auto-create Polar customer when user signs up
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "pro-monthly-id", // Replace with real Polar product ID
                            slug: "pro-monthly",
                        },
                        {
                            productId: "pro-yearly-id", // Replace with real Polar product ID
                            slug: "pro-yearly",
                        },
                    ],
                    successUrl: "/upgrade?success=true&checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true,
                }),
                portal(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onSubscriptionActive: async (payload) => {
                        console.log("[Polar Webhook] Subscription activated:", payload.data.id);
                    },
                    onSubscriptionCanceled: async (payload) => {
                        console.log("[Polar Webhook] Subscription canceled:", payload.data.id);
                    },
                    onOrderPaid: async (payload) => {
                        console.log("[Polar Webhook] Order paid:", payload.data.id);
                    },
                    onPayload: async (payload) => {
                        console.log("[Polar Webhook] Event received:", payload.type);
                    },
                }),
            ],
        }),
    ],
});
