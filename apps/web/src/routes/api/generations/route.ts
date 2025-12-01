import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import {
	actors,
	assets,
	generations,
	type NewGeneration,
	storyboards,
} from "@repo/db/schema";
import type { GenerationRequest } from "@repo/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import auth from "@/lib/auth/auth";

// Assignment type: roleId -> actorId
export type RoleAssignment = {
	roleId: string;
	actorId: string;
};

// Request body type for starting video generation
export type StartGenerationRequest = {
	storyboardId: string;
	assignments: RoleAssignment[];
};

// Response type
export type StartGenerationResponse = {
	generationId: string;
};

export const Route = createFileRoute("/api/generations")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// 1. Authenticate user
				const session = await auth(env).api.getSession({
					headers: request.headers,
				});

				if (!session?.user) {
					console.error("Unauthorized");
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const userId = session.user.id;

				// 2. Parse and validate request body
				let body: StartGenerationRequest;
				try {
					body = await request.json();
				} catch {
					console.error("Invalid JSON body");
					return json({ error: "Invalid JSON body" }, { status: 400 });
				}

				const { storyboardId, assignments } = body;

				if (!storyboardId) {
					console.error("storyboardId is required");
					return json({ error: "storyboardId is required" }, { status: 400 });
				}

				if (
					!assignments ||
					!Array.isArray(assignments) ||
					assignments.length === 0
				) {
					console.error("At least one role assignment is required");
					return json(
						{ error: "At least one role assignment is required" },
						{ status: 400 },
					);
				}

				// Validate assignment structure
				for (const assignment of assignments) {
					if (!assignment.roleId || !assignment.actorId) {
						console.error("Each assignment must have roleId and actorId");
						return json(
							{ error: "Each assignment must have roleId and actorId" },
							{ status: 400 },
						);
					}
				}

				try {
					// 3. Create database connection
					const db = createDb(env.HYPERDRIVE.connectionString);

					const storyboardPromise = db
						.select()
						.from(storyboards)
						.where(eq(storyboards.id, storyboardId))
						.limit(1)
						.then(([storyboard]) => storyboard);

					const realAssignments = assignments.filter(
						(a) => a.actorId !== "auto",
					);

					// Only query DB for real actor IDs
					const selectedActorsPromise =
						realAssignments.length > 0
							? db
									.select({
										id: actors.id,
										name: actors.name,
										assetKey: assets.assetKey,
									})
									.from(actors)
									.innerJoin(assets, eq(actors.assetId, assets.id))
									.where(
										inArray(
											actors.id,
											realAssignments.map((a) => a.actorId),
										),
									)
							: Promise.resolve([]);

					const [storyboard, selectedActors] = await Promise.all([
						storyboardPromise,
						selectedActorsPromise,
					]);

					if (!storyboard) {
						console.error("Storyboard not found");
						return json({ error: "Storyboard not found" }, { status: 400 });
					}

					if (
						realAssignments.length > 0 &&
						(!selectedActors || selectedActors.length === 0)
					) {
						console.error("Selected actors not found");
						return json(
							{ error: "Selected actors not found" },
							{ status: 400 },
						);
					}

					// 4. Create generation record
					const generationId = crypto.randomUUID();
					const generationRequest: GenerationRequest = {
						generationId,
						storyboardId,
						userId,
						aspectRatio: storyboard.data.aspectRatio,
						model: "wan-2.5-i2v",
						outputFormat: "mp4",
						outputStorageKey: `users/${userId}/generations/${generationId}`,
						scenes: storyboard.data.scenes.map((scene) => ({
							sceneId: scene.id,
							order: scene.order,
							firstFramePrompt: scene.firstFramePrompt,
							scenePrompt: scene.scenePrompt,
							durationSeconds: scene.durationSeconds,
							roles: storyboard.data.roles.map((role) => {
								const assignment = realAssignments.find(
									(a) => a.roleId === role.id,
								);
								if (assignment) {
									const actor = selectedActors.find(
										(a) => a.id === assignment.actorId,
									);
									if (!actor) {
										throw new Error(`Actor not found: ${assignment.actorId}`);
									}
									return {
										role: {
											id: role.id,
											name: role.name,
											displayName: role.displayName,
											description: role.description,
										},
										actor: {
											id: actor.id,
											name: actor.name,
											image: {
												key: actor.assetKey,
											},
										},
									};
								} else {
									return {
										role: {
											id: role.id,
											name: role.name,
											displayName: role.displayName,
											description: role.description,
										},
									};
								}
							}),
						})),
						specVersion: 1,
					};
					const generationData: NewGeneration = {
						id: generationId,
						userId,
						generationRequest,
						status: "PENDING",
					};
					const [generation] = await db
						.insert(generations)
						.values(generationData)
						.returning({ id: generations.id });

					// 6. Send job to the video generation queue
					await env.VIDEO_GENERATION_QUEUE.send({ generationRequest });

					console.log(
						`Video generation job ${generationId} created and queued for user ${userId}`,
					);

					// 7. Return the job ID
					return json(
						{ generationId: generation.id } satisfies StartGenerationResponse,
						{
							status: 201,
						},
					);
				} catch (error) {
					console.error({
						message: "Failed to start video generation",
						errorMessage:
							error instanceof Error ? error.message : "Unknown error",
						error,
					});
					return json(
						{ error: "Failed to start video generation" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
