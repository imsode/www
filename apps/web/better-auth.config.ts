/**
 * Better Auth CLI configuration file
 *
 * Docs: https://www.better-auth.com/docs/concepts/cli
 */

import { createDb } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuthOptions } from "@/lib/auth/options";

const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

// biome-ignore lint/style/noNonNullAssertion: environment variable is set
const db = createDb(DATABASE_URL!);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	...betterAuthOptions,
	database: drizzleAdapter(db, { provider: "pg", schema }), // schema is required in order for bettter-auth to recognize
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
});
