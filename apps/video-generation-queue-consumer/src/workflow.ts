import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { generations } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export type VideoGenerationWorkflowParams = {
	generationId: string;
};

// 1. use the template.promot_for_first_frame and user's selfie to create the real first frame by replacing the face in the template.promot_for_first_frame with user's face
// 2. use the generated first frame and template.prompt_for_scene to create the video
// 3. store the generated video to storage and notify user
export class VideoGenerationWorkflow extends WorkflowEntrypoint<
	CloudflareBindings,
	VideoGenerationWorkflowParams
> {
	async run(
		event: WorkflowEvent<VideoGenerationWorkflowParams>,
		step: WorkflowStep,
	) {
		const { generationId } = event.payload;

		await step.do("generate first frame", async () => {
			const db = createDb(this.env.HYPERDRIVE.connectionString);
			const [generation] = await db
				.select()
				.from(generations)
				.where(eq(generations.id, generationId));

			if (!generation) {
				throw new Error(`Generation ${generationId} not found`);
			}

			const { templateId, userId } = generation;
		});
	}
}
