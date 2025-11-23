import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema.ts",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: environment variable is set
		url: process.env.DATABASE_URL!,
	},
});
