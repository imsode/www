import { createDb } from "@repo/db/client";
import { generations } from "@repo/db/schema";
import type { GenerationRequest } from "@repo/types";
import { eq } from "drizzle-orm";

export { VideoGenerationWorkflow } from "./workflow";

export default {
	async queue(batch, env): Promise<void> {
		const db = createDb(env.HYPERDRIVE.connectionString);

		for (const message of batch.messages) {
			try {
				const { generationRequest } = message.body as {
					generationRequest: GenerationRequest;
				};

				if (!generationRequest) {
					console.error({
						message: "Missing generationRequest in message",
						body: message.body,
					});
					message.ack();
					continue;
				}

				await env.VIDEO_GENERATION_WORKFLOW.create({
					params: {
						generationRequest,
					},
				});

				// Example: Update status to PROCESSING
				await db
					.update(generations)
					.set({ status: "PROCESSING" })
					.where(eq(generations.id, generationRequest.generationId));

				message.ack();
			} catch (error) {
				console.error({
					message: "Error processing message",
					id: message.id,
					error,
				});
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<CloudflareBindings>;
