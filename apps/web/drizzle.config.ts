import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: environment variable is set
		url: process.env.DATABASE_URL!,
	},
});
