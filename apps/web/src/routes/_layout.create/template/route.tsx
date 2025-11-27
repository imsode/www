import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { templateRoles, templates, templateTags } from "@repo/db/schema";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, inArray } from "drizzle-orm";
import { useState } from "react";
import { z } from "zod";
import { TemplateSelectionStep } from "../-components/TemplateSelectionStep";
import type { Template, TemplateRole } from "../-types";

const templateSearchSchema = z.object({});

// Use createServerFn to access database directly - this runs ONLY on the server
const fetchTemplates = createServerFn().handler(
	async (): Promise<Template[]> => {
		const db = createDb(env.HYPERDRIVE.connectionString);

		const templateResults = await db
			.select({
				id: templates.id,
				name: templates.name,
				description: templates.description,
				previewImageUrl: templates.previewImageUrl,
				previewVideoUrl: templates.previewVideoUrl,
				durationSeconds: templates.durationSeconds,
			})
			.from(templates);

		if (templateResults.length === 0) {
			return [];
		}

		const templateIds = templateResults.map((t) => t.id);

		const [rolesResults, tagsResults] = await Promise.all([
			db
				.select({
					id: templateRoles.id,
					templateId: templateRoles.templateId,
					roleName: templateRoles.roleName,
					sortOrder: templateRoles.sortOrder,
				})
				.from(templateRoles)
				.where(inArray(templateRoles.templateId, templateIds))
				.orderBy(asc(templateRoles.sortOrder)),
			db
				.select({
					templateId: templateTags.templateId,
					tag: templateTags.tag,
				})
				.from(templateTags)
				.where(inArray(templateTags.templateId, templateIds)),
		]);

		const rolesByTemplateId = new Map<string, TemplateRole[]>();
		for (const role of rolesResults) {
			const existing = rolesByTemplateId.get(role.templateId) || [];
			existing.push({ id: role.id, name: role.roleName });
			rolesByTemplateId.set(role.templateId, existing);
		}

		const tagsByTemplateId = new Map<string, string[]>();
		for (const { templateId, tag } of tagsResults) {
			const existing = tagsByTemplateId.get(templateId) || [];
			existing.push(tag);
			tagsByTemplateId.set(templateId, existing);
		}

		return templateResults.map((template) => ({
			id: template.id,
			name: template.name,
			description: template.description || "",
			image: template.previewImageUrl || "",
			videoUrl: template.previewVideoUrl || "",
			roles: rolesByTemplateId.get(template.id) || [],
			tags: [
				...(tagsByTemplateId.get(template.id) || []),
				...(template.durationSeconds ? [`${template.durationSeconds}s`] : []),
			],
		}));
	},
);

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
