import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";

export type VideoGenerationWorkflowParams = {
	jobId: string;
};

export class VideoGenerationWorkflow extends WorkflowEntrypoint<
	CloudflareBindings,
	VideoGenerationWorkflowParams
> {
	async run(
		event: WorkflowEvent<VideoGenerationWorkflowParams>,
		step: WorkflowStep,
	) {
		await step.do("generate-video", async () => {
			console.log(`Generating video for job ${event.payload.jobId}`);
		});
	}
}
