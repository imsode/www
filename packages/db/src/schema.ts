import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// ================================
// Better Auth
// ================================
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	characters: many(characters),
	generations: many(generations),
	videos: many(videos),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

// ================================
// Business Logic - Templates
// ================================
export const templates = pgTable("templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	previewImageUrl: text("preview_image_url"),
	previewVideoUrl: text("preview_video_url"),
	providerModelId: text("provider_model_id").notNull(),
	durationSeconds: integer("duration_seconds"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const templateRoles = pgTable(
	"template_roles",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		templateId: uuid("template_id")
			.references(() => templates.id, { onDelete: "cascade" })
			.notNull(),
		roleName: text("role_name").notNull(), // e.g., "Hero", "Partner"
		sortOrder: integer("sort_order").default(0).notNull(),
	},
	(table) => [index("templateRoles_templateId_idx").on(table.templateId)],
);

export const templateTags = pgTable(
	"template_tags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		templateId: uuid("template_id")
			.references(() => templates.id, { onDelete: "cascade" })
			.notNull(),
		tag: text("tag").notNull(),
	},
	(table) => [
		index("templateTags_templateId_idx").on(table.templateId),
		index("templateTags_tag_idx").on(table.tag),
	],
);

export const templateRelations = relations(templates, ({ many }) => ({
	roles: many(templateRoles),
	tags: many(templateTags),
	generations: many(generations),
}));

export const templateRoleRelations = relations(templateRoles, ({ one }) => ({
	template: one(templates, {
		fields: [templateRoles.templateId],
		references: [templates.id],
	}),
}));

export const templateTagRelations = relations(templateTags, ({ one }) => ({
	template: one(templates, {
		fields: [templateTags.templateId],
		references: [templates.id],
	}),
}));

// ================================
// Business Logic - Characters
// ================================
export const characters = pgTable(
	"characters",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		// null = system-provided (virtual), set = user's personal character
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		imageKey: text("image_key").notNull(),
		thumbnailKey: text("thumbnail_key"),
		type: text("type", {
			enum: ["USER_SELFIE", "VIRTUAL", "CELEBRITY", "CUSTOM"],
		}).notNull(),
		category: text("category"), // For virtual characters: "Female", "Male", etc.
		isActive: boolean("is_active").default(true).notNull(),
		isPremium: boolean("is_premium").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("characters_userId_idx").on(table.userId),
		index("characters_type_idx").on(table.type),
	],
);

export const characterRelations = relations(characters, ({ one, many }) => ({
	user: one(user, {
		fields: [characters.userId],
		references: [user.id],
	}),
	castings: many(generationCastings),
}));

// ================================
// Business Logic - Generations
// ================================
export const generations = pgTable(
	"generations",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		templateId: uuid("template_id")
			.references(() => templates.id, { onDelete: "restrict" })
			.notNull(),
		status: text("status", {
			enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
		})
			.notNull()
			.default("PENDING"),
		videoFileKey: text("video_file_key"),
		externalId: text("external_id"),
		errorMessage: text("error_message"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("generations_userId_idx").on(table.userId),
		index("generations_status_idx").on(table.status),
	],
);

export const generationCastings = pgTable(
	"generation_castings",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		generationId: uuid("generation_id")
			.references(() => generations.id, { onDelete: "cascade" })
			.notNull(),
		roleId: uuid("role_id")
			.references(() => templateRoles.id, { onDelete: "restrict" })
			.notNull(),
		characterId: uuid("character_id")
			.references(() => characters.id, { onDelete: "restrict" })
			.notNull(),
	},
	(table) => [
		index("generationCastings_generationId_idx").on(table.generationId),
	],
);

export const generationRelations = relations(generations, ({ one, many }) => ({
	user: one(user, {
		fields: [generations.userId],
		references: [user.id],
	}),
	template: one(templates, {
		fields: [generations.templateId],
		references: [templates.id],
	}),
	castings: many(generationCastings),
	video: one(videos),
}));

export const generationCastingRelations = relations(
	generationCastings,
	({ one }) => ({
		generation: one(generations, {
			fields: [generationCastings.generationId],
			references: [generations.id],
		}),
		role: one(templateRoles, {
			fields: [generationCastings.roleId],
			references: [templateRoles.id],
		}),
		character: one(characters, {
			fields: [generationCastings.characterId],
			references: [characters.id],
		}),
	}),
);

// ================================
// Business Logic - Videos (Published Content)
// ================================
export const videos = pgTable(
	"videos",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// Source generation (optional - could support direct upload in future)
		generationId: uuid("generation_id").references(() => generations.id, {
			onDelete: "set null",
		}),
		// Content
		caption: text("caption"),
		videoFileKey: text("video_file_key").notNull(),
		thumbnailKey: text("thumbnail_key"),
		durationSeconds: integer("duration_seconds"),
		// Visibility
		visibility: text("visibility", {
			enum: ["PUBLIC", "PRIVATE", "UNLISTED"],
		})
			.notNull()
			.default("PUBLIC"),
		// Engagement counters (denormalized for performance)
		likesCount: integer("likes_count").default(0).notNull(),
		commentsCount: integer("comments_count").default(0).notNull(),
		sharesCount: integer("shares_count").default(0).notNull(),
		viewsCount: integer("views_count").default(0).notNull(),
		// Timestamps
		publishedAt: timestamp("published_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("videos_userId_idx").on(table.userId),
		index("videos_visibility_idx").on(table.visibility),
		index("videos_publishedAt_idx").on(table.publishedAt),
	],
);

export const videoTags = pgTable(
	"video_tags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		videoId: uuid("video_id")
			.references(() => videos.id, { onDelete: "cascade" })
			.notNull(),
		tag: text("tag").notNull(),
	},
	(table) => [
		index("videoTags_videoId_idx").on(table.videoId),
		index("videoTags_tag_idx").on(table.tag),
	],
);

export const videoRelations = relations(videos, ({ one, many }) => ({
	user: one(user, {
		fields: [videos.userId],
		references: [user.id],
	}),
	generation: one(generations, {
		fields: [videos.generationId],
		references: [generations.id],
	}),
	tags: many(videoTags),
}));

export const videoTagRelations = relations(videoTags, ({ one }) => ({
	video: one(videos, {
		fields: [videoTags.videoId],
		references: [videos.id],
	}),
}));

// ================================
// Type Exports
// ================================
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

export type TemplateRole = typeof templateRoles.$inferSelect;
export type NewTemplateRole = typeof templateRoles.$inferInsert;

export type TemplateTag = typeof templateTags.$inferSelect;
export type NewTemplateTag = typeof templateTags.$inferInsert;

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;

export type GenerationCasting = typeof generationCastings.$inferSelect;
export type NewGenerationCasting = typeof generationCastings.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type VideoTag = typeof videoTags.$inferSelect;
export type NewVideoTag = typeof videoTags.$inferInsert;
// ================================
