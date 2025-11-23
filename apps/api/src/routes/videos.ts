import { createDb } from "@repo/db/client";
import { generations, templates } from "@repo/db/schema";
import { AwsClient } from "aws4fetch";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const videosRouter = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * POST /api/videos/generate
 * Starts an asynchronous video generation job.
 */
videosRouter.post("/generate", async (c) => {
	const { userId, templateId, selfieImageKey } = await c.req.json<{
		userId: string;
		templateId: string; // UUID
		selfieImageKey: string;
	}>();

	if (!userId || !templateId || !selfieImageKey) {
		return c.json(
			{ error: "Missing required fields: userId, templateId, selfieImageKey" },
			400,
		);
	}

	const db = createDb(c.env.HYPERDRIVE.connectionString);

	try {
		// 1. Validate Template
		const [template] = await db
			.select()
			.from(templates)
			.where(eq(templates.id, templateId))
			.limit(1);

		if (!template) {
			return c.json({ error: "Invalid templateId" }, 400);
		}

		// 2. Create Generation Record (PENDING)
		const [job] = await db
			.insert(generations)
			.values({
				userId,
				templateId,
				selfieImageKey,
				status: "PENDING",
			})
			.returning();

		// 3. Send job id to Video Generation Queue
		await c.env.VIDEO_GENERATION_QUEUE.send({
			jobId: job.id,
		});

		return c.json({
			jobId: job.id,
			status: job.status,
		});
	} catch (error) {
		console.error("Error starting generation:", error);
		return c.json({ error: "Failed to start generation job" }, 500);
	}
});

/**
 * GET /api/videos/:videoId/url
 * Gets a signed download/stream URL for a completed video.
 */
videosRouter.get("/:videoId/url", async (c) => {
	const videoId = c.req.param("videoId");
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	try {
		// 1. Look up job
		const [job] = await db
			.select()
			.from(generations)
			.where(eq(generations.id, videoId))
			.limit(1);

		if (!job) {
			return c.json({ error: "Video not found" }, 404);
		}

		// 2. Check status
		if (job.status !== "COMPLETED") {
			return c.json(
				{ error: "Video generation not completed yet", status: job.status },
				400,
			);
		}

		if (!job.videoFileKey) {
			return c.json({ error: "Video file key missing" }, 500);
		}

		// 3. Generate Signed URL
		const r2 = new AwsClient({
			accessKeyId: c.env.R2_ACCESS_KEY_ID,
			secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
			service: "s3",
			region: "auto",
		});

		const bucketName = c.env.VIDEO_BUCKET_NAME; // Video bucket name
		const key = job.videoFileKey;

		const url = new URL(
			`https://${c.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`,
		);
		url.searchParams.set("X-Amz-Expires", "3600");

		// Sign for GET
		const signed = await r2.sign(
			new Request(url, {
				method: "GET",
			}),
			{
				aws: { signQuery: true },
			},
		);

		return c.json({
			videoUrl: signed.url,
			expiresIn: 3600,
		});
	} catch (error) {
		console.error("Error getting video url:", error);
		return c.json({ error: "Failed to get video URL" }, 500);
	}
});

export default videosRouter;
