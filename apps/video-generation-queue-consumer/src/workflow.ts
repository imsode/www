import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import type { GenerationRequest } from "@repo/types";

export type VideoGenerationWorkflowParams = {
	generationRequest: GenerationRequest;
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
		const { generationRequest } = event.payload;

		await step.do("generate first frame", async () => {
			console.log({ message: "Generating first frame", generationRequest });
			return generationRequest;
		});

		return generationRequest;
	}
}
