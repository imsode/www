import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import type { Character } from "@/routes/api/characters/route";
import type { Template } from "@/routes/api/templates/route";
import { CastingStep } from "../-components/CastingStep";

type StartGenerationInput = {
	assignments: Record<string, string>;
	templateId: string;
};

export const startVideoGeneration = createServerFn({ method: "POST" })
	.inputValidator((data: StartGenerationInput) => data)
	.handler(async ({ data }) => {
		console.log("Starting generation with", data);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return { jobId: Math.random().toString(36).substring(7) };
	});

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
		mutationFn: startVideoGeneration,
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
				data: { assignments, templateId: search.templateId },
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
			onAssign={(role, charId) =>
				setAssignments((prev) => ({ ...prev, [role]: charId }))
			}
			onGenerate={handleGenerate}
			onBack={handleBack}
			onCancel={() => navigate({ to: "/" })}
			isGenerating={startMutation.isPending}
		/>
	);
}
