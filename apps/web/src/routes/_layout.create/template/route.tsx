import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { TemplateSelectionStep } from "../-components/TemplateSelectionStep";
import { TEMPLATES } from "../-constants";

const templateSearchSchema = z.object({});

export const Route = createFileRoute("/_layout/create/template")({
	validateSearch: (search) => templateSearchSchema.parse(search),
	component: TemplatePage,
});

function TemplatePage() {
	const navigate = useNavigate();
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
			templates={TEMPLATES}
			selectedTemplateId={selectedTemplateId}
			onSelect={setSelectedTemplateId}
			onNext={handleNext}
			onBack={handleBack}
			onCancel={() => navigate({ to: "/" })}
		/>
	);
}
