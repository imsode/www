import { AwsClient } from "aws4fetch";
import { Hono } from "hono";

const uploadsRouter = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * POST /api/uploads/selfies/presigned
 * Generates a pre-signed URL for uploading a selfie to R2.
 */
uploadsRouter.post("/selfies/presigned", async (c) => {
	const { userId, contentType } = await c.req.json<{
		userId: string;
		contentType: string;
	}>();

	if (!userId || !contentType) {
		return c.json({ error: "Missing userId or contentType" }, 400);
	}

	const r2 = new AwsClient({
		accessKeyId: c.env.R2_ACCESS_KEY_ID,
		secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
		service: "s3",
		region: "auto",
	});

	const fileId = crypto.randomUUID();
	// File extension logic could be improved, assume jpg/png for now based on contentType
	const ext = contentType.split("/")[1] || "jpg";
	const key = `users/${userId}/selfies/${fileId}.${ext}`;
	const bucketName = c.env.SELFIE_BUCKET_NAME; // Must match the actual R2 bucket name in Cloudflare

	// Construct the S3 endpoint for R2
	const url = new URL(
		`https://${c.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`,
	);
	url.searchParams.set("X-Amz-Expires", "3600");

	// Sign the request for a PUT operation
	// We sign the URL so the client can use it with the specific method and headers
	const signed = await r2.sign(
		new Request(url, {
			method: "PUT",
			headers: {
				"Content-Type": contentType,
			},
		}),
		{
			aws: { signQuery: true },
		},
	);

	return c.json({
		uploadUrl: signed.url,
		imageKey: key,
		expiresIn: 3600,
	});
});

export default uploadsRouter;
