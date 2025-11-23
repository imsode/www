import { AwsClient } from "aws4fetch";
import { Hono } from "hono";

const selfiesRouter = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * GET /api/selfies/:key/url
 * Generates a pre-signed URL for viewing/downloading a selfie from R2.
 * Note: The 'key' parameter usually contains slashes (e.g. users/123/selfies/abc.jpg).
 * Hono handles encoded slashes, but clients must encode the key properly.
 */
selfiesRouter.get("/:key{[a-zA-Z0-9/_.-]+}/url", async (c) => {
	const key = c.req.param("key");

	if (!key) {
		return c.json({ error: "Missing key" }, 400);
	}

	const r2 = new AwsClient({
		accessKeyId: c.env.R2_ACCESS_KEY_ID,
		secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
		service: "s3",
		region: "auto",
	});

	const bucketName = c.env.SELFIE_BUCKET_NAME;

	// Construct the S3 endpoint for R2
	const url = new URL(
		`https://${c.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`,
	);
	url.searchParams.set("X-Amz-Expires", "3600");

	// Sign the request for a GET operation
	const signed = await r2.sign(
		new Request(url, {
			method: "GET",
		}),
		{
			aws: { signQuery: true },
		},
	);

	return c.json({
		url: signed.url,
		expiresIn: 3600,
	});
});

export default selfiesRouter;
