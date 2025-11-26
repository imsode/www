import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import type { Template } from "@/routes/api/templates/route";
import { TemplateSelectionStep } from "../-components/TemplateSelectionStep";

const templateSearchSchema = z.object({});

async function fetchTemplates(): Promise<Template[]> {
	const response = await fetch("/api/templates");
	if (!response.ok) {
		throw new Error("Failed to fetch templates");
	}
	const data: { templates: Template[] } = await response.json();
	return data.templates;
}

export const Route = createFileRoute("/_layout/create/template")({
	validateSearch: (search) => templateSearchSchema.parse(search),
	loader: () => fetchTemplates(),
	component: TemplatePage,
});

function TemplatePage() {
	const navigate = useNavigate();
	const templates = Route.useLoaderData();
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);

	const handleNext = (templateId?: string) => {
		const idToUse =
			typeof templateId === "string" ? templateId : selectedTemplateId;

		if (!idToUse) return;

		navigate({
			to: "/create/casting",
			search: {
				templateId: idToUse,
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
			templates={templates}
			selectedTemplateId={selectedTemplateId}
			onSelect={setSelectedTemplateId}
			onNext={handleNext}
			onBack={handleBack}
			onCancel={() => navigate({ to: "/" })}
		/>
	);
}
