import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import type { Character } from "@/routes/api/characters/route";
import type { StartGenerationResponse } from "@/routes/api/generations/route";
import type { Template } from "@/routes/api/templates/route";
import { CastingStep } from "../-components/CastingStep";

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

async function fetchCastingData(
	templateId: string,
): Promise<{ template: Template | null; characters: Character[] }> {
	const [templatesRes, charactersRes] = await Promise.all([
		fetch("/api/templates"),
		fetch("/api/characters"),
	]);

	if (!templatesRes.ok || !charactersRes.ok) {
		throw new Error("Failed to fetch casting data");
	}

	const templatesData: { templates: Template[] } = await templatesRes.json();
	const charactersData: { characters: Character[] } =
		await charactersRes.json();

	return {
		template: templatesData.templates.find((t) => t.id === templateId) ?? null,
		characters: charactersData.characters,
	};
}

export const Route = createFileRoute("/_layout/create/casting")({
	validateSearch: (search) => castingSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({ templateId: search.templateId }),
	loader: ({ deps }) => fetchCastingData(deps.templateId),
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
					jobId: data.jobId,
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
