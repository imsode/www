import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { templateRoles, templates, templateTags } from "@repo/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { asc, inArray } from "drizzle-orm";
import type { Template, TemplateRole } from "@/routes/_layout.create/-types";

export type { Template, TemplateRole };

export const Route = createFileRoute("/api/templates")({
	server: {
		handlers: {
			GET: async () => {
				const db = createDb(env.HYPERDRIVE.connectionString);

				// Fetch all templates
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
					return json({ templates: [] });
				}

				const templateIds = templateResults.map((t) => t.id);

				// Fetch roles for all templates in batch
				const rolesResults = await db
					.select({
						id: templateRoles.id,
						templateId: templateRoles.templateId,
						roleName: templateRoles.roleName,
						sortOrder: templateRoles.sortOrder,
					})
					.from(templateRoles)
					.where(inArray(templateRoles.templateId, templateIds))
					.orderBy(asc(templateRoles.sortOrder));

				// Fetch tags for all templates in batch
				const tagsResults = await db
					.select({
						templateId: templateTags.templateId,
						tag: templateTags.tag,
					})
					.from(templateTags)
					.where(inArray(templateTags.templateId, templateIds));

				// Group roles by template ID
				const rolesByTemplateId = new Map<string, TemplateRole[]>();
				for (const role of rolesResults) {
					const existing = rolesByTemplateId.get(role.templateId) || [];
					existing.push({
						id: role.id,
						name: role.roleName,
					});
					rolesByTemplateId.set(role.templateId, existing);
				}

				// Group tags by template ID
				const tagsByTemplateId = new Map<string, string[]>();
				for (const { templateId, tag } of tagsResults) {
					const existing = tagsByTemplateId.get(templateId) || [];
					existing.push(tag);
					tagsByTemplateId.set(templateId, existing);
				}

				// Transform to Template format
				const templatesResponse: Template[] = templateResults.map(
					(template) => ({
						id: template.id,
						name: template.name,
						description: template.description || "",
						image: template.previewImageUrl || "",
						videoUrl: template.previewVideoUrl || "",
						roles: rolesByTemplateId.get(template.id) || [],
						tags: [
							...(tagsByTemplateId.get(template.id) || []),
							// Add duration as a tag if available
							...(template.durationSeconds
								? [`${template.durationSeconds}s`]
								: []),
						],
					}),
				);

				return json({ templates: templatesResponse });
			},
		},
	},
});
