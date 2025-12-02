import { env } from "cloudflare:workers";
import { AwsClient } from "aws4fetch";
import { z } from "zod";

const inputSchema = z.object({
	key: z.string().min(1, "file key is required"),
});

export type PresignReadInput = z.infer<typeof inputSchema>;

export type PresignReadResponse = {
	url: string;
	method: "GET";
	headers: Record<string, string>;
	key: string;
	bucket: string;
};

/**
 * Pure helper function that generates an R2 presigned GET URL for reads.
 * Can be called directly from server-side code (API routes, other server functions).
 */
export async function presignRead(
	input: PresignReadInput,
): Promise<PresignReadResponse> {
	console.log({ message: "Presigning read" });
	const { key } = inputSchema.parse(input);

	if (!key) {
		throw new Error("Key is required");
	}

	if (
		!env.R2_ACCESS_KEY_ID ||
		!env.R2_SECRET_ACCESS_KEY ||
		!env.CF_ACCOUNT_ID
	) {
		throw new Error("R2 credentials are not configured");
	}

	const bucket = env.VIDEO_BUCKET_NAME || "your-story";
	const normalizedKey = key.replace(/^\/+/, "");
	const encodedKey = normalizedKey
		.split("/")
		.map((part) => encodeURIComponent(part))
		.join("/");

	const aws = new AwsClient({
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		region: "auto",
		service: "s3",
	});

	const objectUrl = `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${encodedKey}`;

	// TODO: Remove this after testing
	console.log({ message: "Object URL", objectUrl });

	const signed = await aws.sign(objectUrl, {
		method: "GET",
		aws: {
			signQuery: true,
		},
	});

	// TODO: Remove this after testing
	console.log({ message: "Signed object URL", signed });

	return {
		url: signed.url,
		method: "GET",
		headers: {},
		key: normalizedKey,
		bucket,
	};
}
