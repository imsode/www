import { createDb } from "@repo/db/client";
import { generations } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export { VideoGenerationWorkflow } from "./workflow";

export default {
	async queue(batch, env): Promise<void> {
		const db = createDb(env.HYPERDRIVE.connectionString);

		for (const message of batch.messages) {
			try {
				console.log(`Processing message ${message.id}`, message.body);
				const { jobId } = message.body as { jobId: string };

				if (!jobId) {
					console.error("Missing jobId in message", message.body);
					message.ack();
					continue;
				}

				await env.VIDEO_GENERATION_WORKFLOW.create({
					params: {
						jobId,
					},
				});

				// Example: Update status to PROCESSING
				await db
					.update(generations)
					.set({ status: "PROCESSING" })
					.where(eq(generations.id, jobId));

				message.ack();
			} catch (error) {
				console.error(`Error processing message ${message.id}`, error);
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<CloudflareBindings>;
