import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { characters, templateRoles, templates } from "@repo/db/schema";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq, isNull } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import type { StartGenerationResponse } from "@/routes/api/generations/route";
import { CastingStep } from "../-components/CastingStep";
import type { Character, Template, TemplateRole } from "../-types";

type StartGenerationInput = {
	templateId: string;
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
			templateId: input.templateId,
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

const castingSearchSchema = z.object({
	templateId: z.string(),
});

const PLACEHOLDER_IMAGE_BASE = "https://api.dicebear.com/7.x/avataaars/svg";

// Use createServerFn to access database directly - this runs ONLY on the server
const fetchCastingData = createServerFn()
	.inputValidator((data: { templateId: string }) => data)
	.handler(
		async ({
			data,
		}): Promise<{ template: Template | null; characters: Character[] }> => {
			const db = createDb(env.HYPERDRIVE.connectionString);

			// Fetch the specific template
			const templateResult = await db
				.select({
					id: templates.id,
					name: templates.name,
					description: templates.description,
					previewImageUrl: templates.previewImageUrl,
					previewVideoUrl: templates.previewVideoUrl,
					durationSeconds: templates.durationSeconds,
				})
				.from(templates)
				.where(eq(templates.id, data.templateId))
				.limit(1);

			let template: Template | null = null;

			if (templateResult.length > 0) {
				const t = templateResult[0];

				// Fetch roles for this template
				const rolesResult = await db
					.select({
						id: templateRoles.id,
						roleName: templateRoles.roleName,
					})
					.from(templateRoles)
					.where(eq(templateRoles.templateId, data.templateId))
					.orderBy(asc(templateRoles.sortOrder));

				const roles: TemplateRole[] = rolesResult.map((r) => ({
					id: r.id,
					name: r.roleName,
				}));

				template = {
					id: t.id,
					name: t.name,
					description: t.description || "",
					image: t.previewImageUrl || "",
					videoUrl: t.previewVideoUrl || "",
					roles,
					tags: t.durationSeconds ? [`${t.durationSeconds}s`] : [],
				};
			}

			// Fetch characters (virtual characters only for now, since we don't have auth context)
			const characterResults = await db
				.select({
					id: characters.id,
					name: characters.name,
					imageKey: characters.imageKey,
					type: characters.type,
				})
				.from(characters)
				.where(isNull(characters.userId))
				.orderBy(asc(characters.name));

			const charactersResponse: Character[] = characterResults.map((c) => ({
				id: c.id,
				name: c.name,
				imageUrl: `${PLACEHOLDER_IMAGE_BASE}?seed=${encodeURIComponent(c.name)}`,
				isUser: c.type === "USER_SELFIE",
			}));

			return {
				template,
				characters: charactersResponse,
			};
		},
	);

export const Route = createFileRoute("/_layout/create/casting")({
	validateSearch: (search) => castingSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({ templateId: search.templateId }),
	loader: ({ deps }) =>
		fetchCastingData({ data: { templateId: deps.templateId } }),
	component: CastingPage,
});

function CastingPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [assignments, setAssignments] = useState<Record<string, string>>({});

	const { template, characters } = Route.useLoaderData();

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
		if (search.templateId && Object.keys(assignments).length > 0) {
			startMutation.mutate({
				templateId: search.templateId,
				assignments, // Record<roleId, characterId>
			});
		}
	};

	const handleBack = () => {
		navigate({
			to: "/create/template",
		});
	};

	if (!template) return <div>Template not found</div>;

	return (
		<CastingStep
			template={template}
			characters={characters}
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
