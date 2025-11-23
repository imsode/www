import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	previewImageUrl: text("preview_image_url"),
	providerModelId: text("provider_model_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const generations = pgTable("generations", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(), // Indexed in DB (add index manually or via drizzle-kit if needed)
	templateId: uuid("template_id")
		.references(() => templates.id)
		.notNull(),
	selfieImageKey: text("selfie_image_key").notNull(),
	videoFileKey: text("video_file_key"),
	status: text("status", {
		enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
	})
		.notNull()
		.default("PENDING"),
	externalId: text("external_id"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;

