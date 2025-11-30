import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { assets, storyboards } from "@repo/db/schema";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import { presignRead } from "@/lib/presign";
import { TemplateSelectionStep } from "../-components/TemplateSelectionStep";
import type { Storyboard } from "../-types";

const templateSearchSchema = z.object({});

// Use createServerFn to access database directly - this runs ONLY on the server
const fetchStoryboards = createServerFn().handler(
	async (): Promise<Storyboard[]> => {
		const db = createDb(env.HYPERDRIVE.connectionString);

		const storyboardResults = await db
			.select({
				id: storyboards.id,
				data: storyboards.data,
				previewVideoAssetKey: assets.assetKey,
				previewVideoAssetPosterKey: assets.posterKey,
			})
			.from(storyboards)
			.innerJoin(assets, eq(storyboards.previewVideoAssetId, assets.id));

		if (storyboardResults.length === 0) {
			return [];
		}

		return await Promise.all(
			storyboardResults.map(async (storyboard) => {
				const [image, video] = await Promise.all([
					presignRead({ data: { key: storyboard.previewVideoAssetPosterKey } }),
					presignRead({ data: { key: storyboard.previewVideoAssetKey } }),
				]);
				return {
					id: storyboard.id,
					name: storyboard.data.title,
					description: storyboard.data.description,
					previewImageUrl: image.url,
					previewVideoUrl: video.url,
					roles: storyboard.data.roles,
					tags: storyboard.data.tags,
				};
			}),
		);
	},
);

export const Route = createFileRoute("/_layout/create/template")({
	validateSearch: (search) => templateSearchSchema.parse(search),
	loader: () => fetchStoryboards(),
	component: TemplatePage,
});

function TemplatePage() {
	const navigate = useNavigate();
	const storyboards = Route.useLoaderData();
	const [selectedStoryboardId, setSelectedStoryboardId] = useState<
		string | null
	>(null);

	const handleNext = (storyboardId?: string) => {
		const idToUse =
			typeof storyboardId === "string" ? storyboardId : selectedStoryboardId;

		if (!idToUse) return;

		navigate({
			to: "/create/casting/$storyboardId",
			params: {
				storyboardId: idToUse,
			},
		});
	};

	const handleBack = () => {
		navigate({
			to: "/",
		});
	};

	return (
		<TemplateSelectionStep
			storyboards={storyboards}
			selectedStoryboardId={selectedStoryboardId}
			onSelect={setSelectedStoryboardId}
			onNext={handleNext}
			onBack={handleBack}
			onCancel={() => navigate({ to: "/" })}
		/>
	);
}
