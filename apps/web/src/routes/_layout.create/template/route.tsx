import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { TemplateSelectionStep } from "../-components/TemplateSelectionStep";
import { TEMPLATES } from "../-constants";

const templateSearchSchema = z.object({
	characterIds: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/_layout/create/template")({
	validateSearch: (search) => templateSearchSchema.parse(search),
	component: TemplatePage,
});

function TemplatePage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);

	const handleNext = () => {
		navigate({
			to: "/create/casting",
			search: {
				characterIds: search.characterIds,
				templateId: selectedTemplateId!,
			},
		});
	};

	const handleBack = () => {
		// Preserve character selection when going back
		navigate({
			to: "/create/characters",
			search: {
				characterIds: search.characterIds,
			},
		});
	};

	return (
		<TemplateSelectionStep
			templates={TEMPLATES}
			selectedTemplateId={selectedTemplateId}
			onSelect={setSelectedTemplateId}
			onNext={handleNext}
			onBack={handleBack}
		/>
	);
}
