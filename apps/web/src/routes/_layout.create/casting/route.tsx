import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { CastingStep } from "../-components/CastingStep";
import { DEMO_USER_ID, MOCK_CHARACTERS, TEMPLATES } from "../-constants";

// Reuse the server function from the parent/previous implementation
// Ideally this should be in a shared api file, but keeping it here for now as per existing pattern
// We will redefine it here or import if we extracted it.
// Let's extract the server functions to a separate file to avoid duplication errors if we keep the old route file around
// But since we replaced route.tsx, we need to re-declare or import.
// I'll re-declare for simplicity in this refactor step, but ideally utils.

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
	characterIds: z.array(z.string()).optional(),
	templateId: z.string(),
});

export const Route = createFileRoute("/_layout/create/casting")({
	validateSearch: (search) => castingSearchSchema.parse(search),
	component: CastingPage,
});

function CastingPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [assignments, setAssignments] = useState<Record<string, string>>({});

	const template = TEMPLATES.find((t) => t.id === search.templateId);
	// Filter characters based on IDs passed in URL
	const selectedCharacters = MOCK_CHARACTERS.filter((c) =>
		search.characterIds?.includes(c.id),
	);

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
			search: {
				characterIds: search.characterIds,
			},
		});
	};

	if (!template) return <div>Template not found</div>;

	return (
		<CastingStep
			template={template}
			characters={selectedCharacters} // Pass fully populated characters
			selectedCharacterIds={search.characterIds || []}
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
