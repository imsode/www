import { createDb } from "@repo/db/client";
import { generations } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const usersRouter = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * GET /api/users/:userId/videos
 * Retrieves all video generation jobs for a specific user.
 */
usersRouter.get("/:userId/videos", async (c) => {
	const userId = c.req.param("userId");
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	try {
		const userVideos = await db
			.select()
			.from(generations)
			.where(eq(generations.userId, userId))
			.orderBy(generations.createdAt);

		return c.json({
			videos: userVideos,
		});
	} catch (error) {
		console.error("Error fetching user videos:", error);
		return c.json({ error: "Failed to fetch videos" }, 500);
	}
});

export default usersRouter;
