import { createDb } from "@repo/db/client";
import { templates } from "@repo/db/schema";
import { Hono } from "hono";

const templatesRouter = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * GET /api/templates
 * Retrieves a list of available video templates.
 */
templatesRouter.get("/", async (c) => {
	try {
		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const allTemplates = await db.select().from(templates);
		return c.json({ templates: allTemplates });
	} catch (error) {
		console.error("Error fetching templates:", error);
		return c.json({ error: "Failed to fetch templates" }, 500);
	}
});

export default templatesRouter;
