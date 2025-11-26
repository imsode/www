import { createDb } from "@repo/db/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { betterAuthOptions } from "./options";

// Create database connection for auth
// Note: In production, DATABASE_URL should be set in Cloudflare secrets

export default function auth(
	env: CloudflareBindings,
): ReturnType<typeof betterAuth> {
	const db = createDb(env.HYPERDRIVE.connectionString);
	return betterAuth({
		...betterAuthOptions,
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		plugins: [
			tanstackStartCookies(), // Must be the last plugin
		],
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
	});
}

export type Auth = typeof auth;
