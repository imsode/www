import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { actors, assets, storyboards } from "@repo/db/schema";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { getSessionFn } from "@/lib/auth/session";
import { presignRead } from "@/lib/presign";
import type { StartGenerationResponse } from "@/routes/api/generations/route";
import { CastingStep } from "../../-components/CastingStep";
import type { Actor, Storyboard } from "../../-types";

type StartGenerationInput = {
	storyboardId: string;
	assignments: Record<string, string>; // roleId -> characterId
};

async function startVideoGeneration(
	input: StartGenerationInput,
): Promise<StartGenerationResponse> {
	// Convert Record to array format expected by the API
	const assignments = Object.entries(input.assignments).map(
		([roleId, characterId]) => ({ roleId, characterId }),
	);

	const response = await fetch("/api/generations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			storyboardId: input.storyboardId,
			assignments,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			(error as { error: string }).error || "Failed to start video generation",
		);
	}

	return response.json();
}

// Use createServerFn to access database directly - this runs ONLY on the server
const fetchCastingData = createServerFn()
	.inputValidator((data: { storyboardId: string }) => data)
	.handler(
		async ({
			data,
		}): Promise<{ storyboard: Storyboard | null; actors: Actor[] }> => {
			const session = await getSessionFn();
			const userId = session?.user?.id;
			if (!userId) {
				throw new Error("User not authenticated");
			}

			const db = createDb(env.HYPERDRIVE.connectionString);

			// Fetch the specific template
			const storyboardResult = await db
				.select({
					id: storyboards.id,
					data: storyboards.data,
					previewVideoAssetKey: assets.assetKey,
					previewVideoAssetPosterKey: assets.posterKey,
				})
				.from(storyboards)
				.where(eq(storyboards.id, data.storyboardId))
				.innerJoin(assets, eq(storyboards.previewVideoAssetId, assets.id))
				.limit(1);

			let storyboard: Storyboard | null = null;

			if (storyboardResult.length > 0) {
				const t = storyboardResult[0];
				const previewVideoUrl = await presignRead({
					data: { key: t.previewVideoAssetKey },
				});
				const previewVideoPosterUrl = await presignRead({
					data: { key: t.previewVideoAssetPosterKey },
				});

				storyboard = {
					id: t.id,
					name: t.data.title,
					description: t.data.description,
					previewImageUrl: previewVideoPosterUrl.url,
					previewVideoUrl: previewVideoUrl.url,
					roles: t.data.roles,
					tags: t.data.tags,
				};
			}

			// Only get user actors for now
			const actorResults = await db
				.select({
					id: actors.id,
					name: actors.name,
					assetKey: assets.assetKey,
					type: actors.type,
				})
				.from(actors)
				.innerJoin(assets, eq(actors.assetId, assets.id))
				.where(eq(actors.userId, userId));

			const imageUrl = await presignRead({
				data: { key: actorResults[0].assetKey },
			});

			return {
				storyboard,
				actors: actorResults.map((a) => ({
					id: a.id,
					name: a.name,
					imageUrl: imageUrl.url,
					isUser: a.type === "USER_SELFIE",
				})),
			};
		},
	);

export const Route = createFileRoute("/_layout/create/casting/$storyboardId")({
	loader: ({ params }) =>
		fetchCastingData({ data: { storyboardId: params.storyboardId } }),
	component: CastingPage,
});

function CastingPage() {
	const navigate = useNavigate();
	const { storyboardId } = Route.useParams();
	const [assignments, setAssignments] = useState<Record<string, string>>({});

	const { storyboard, actors } = Route.useLoaderData();

	const startMutation = useMutation({
		mutationFn: (input: StartGenerationInput) => startVideoGeneration(input),
		onSuccess: (data) => {
			navigate({
				to: "/create/generating",
				search: {
					generationId: data.generationId,
				},
			});
		},
	});

	const handleGenerate = () => {
		if (storyboardId && Object.keys(assignments).length > 0) {
			startMutation.mutate({
				storyboardId,
				assignments, // Record<roleId, characterId>
			});
		}
	};

	const handleBack = () => {
		navigate({
			to: "/create/template",
		});
	};

	if (!storyboard) return <div>Storyboard not found</div>;

	return (
		<CastingStep
			storyboard={storyboard}
			actors={actors}
			assignments={assignments}
			onAssign={(roleId, charId) =>
				setAssignments((prev) => ({ ...prev, [roleId]: charId }))
			}
			onGenerate={handleGenerate}
			onBack={handleBack}
			onCancel={() => navigate({ to: "/" })}
			isGenerating={startMutation.isPending}
		/>
	);
}
