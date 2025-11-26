import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { generationCastings, generations } from "@repo/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import auth from "@/lib/auth/auth";

// Assignment type: roleId -> characterId
export type RoleAssignment = {
	roleId: string;
	characterId: string;
};

// Request body type for starting video generation
export type StartGenerationRequest = {
	templateId: string;
	assignments: RoleAssignment[];
};

// Response type
export type StartGenerationResponse = {
	jobId: string;
};

export const Route = createFileRoute("/api/generations")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				console.log("POST /api/generations");
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

				const { templateId, assignments } = body;

				if (!templateId) {
					console.error("templateId is required");
					return json({ error: "templateId is required" }, { status: 400 });
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
					if (!assignment.roleId || !assignment.characterId) {
						console.error("Each assignment must have roleId and characterId");
						return json(
							{ error: "Each assignment must have roleId and characterId" },
							{ status: 400 },
						);
					}
				}

				try {
					// 3. Create database connection
					const db = createDb(env.HYPERDRIVE.connectionString);

					// 4. Create generation record
					const [generation] = await db
						.insert(generations)
						.values({
							userId,
							templateId,
							status: "PENDING",
						})
						.returning({ id: generations.id });

					const jobId = generation.id;

					// 5. Create casting records for each assignment
					const castingValues = assignments.map(({ roleId, characterId }) => ({
						generationId: jobId,
						roleId,
						characterId,
					}));

					await db.insert(generationCastings).values(castingValues);

					// 6. Send job to the video generation queue
					await env.VIDEO_GENERATION_QUEUE.send({ jobId });

					console.log(
						`Video generation job ${jobId} created and queued for user ${userId}`,
					);

					// 7. Return the job ID
					return json({ jobId } satisfies StartGenerationResponse, {
						status: 201,
					});
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
