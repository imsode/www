import type { GenerationRequest, Storyboard } from "@repo/types";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
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
	actors: many(actors),
	generations: many(generations),
	videos: many(videos),
	storyboards: many(storyboards),
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
// Business Logic - Characters
// ================================
export const actors = pgTable(
	"actors",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		// null = system-provided (virtual), set = user's personal character
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		assetId: uuid("asset_id")
			.references(() => assets.id, { onDelete: "restrict" })
			.notNull(),
		type: text("type", {
			enum: ["USER_SELFIE", "VIRTUAL"],
		}).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("actors_userId_idx").on(table.userId),
		index("actors_type_idx").on(table.type),
	],
);

export const actorRelations = relations(actors, ({ one }) => ({
	user: one(user, {
		fields: [actors.userId],
		references: [user.id],
	}),
	asset: one(assets, {
		fields: [actors.assetId],
		references: [assets.id],
	}),
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
		generationRequest: jsonb("generation_request")
			.$type<GenerationRequest>()
			.notNull(),
		status: text("status", {
			enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
		})
			.notNull()
			.default("PENDING"),
		generatedAssetId: uuid("generated_asset_id").references(() => assets.id, {
			onDelete: "restrict",
		}),
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

export const generationRelations = relations(generations, ({ one }) => ({
	user: one(user, {
		fields: [generations.userId],
		references: [user.id],
	}),
	generatedAsset: one(assets, {
		fields: [generations.generatedAssetId],
		references: [assets.id],
	}),
}));

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
		// Content
		caption: text("caption").notNull(),
		assetId: uuid("asset_id")
			.references(() => assets.id, { onDelete: "restrict" })
			.notNull(),
		// Engagement counters (denormalized for performance)
		likesCount: integer("likes_count").default(0).notNull(),
		commentsCount: integer("comments_count").default(0).notNull(),
		sharesCount: integer("shares_count").default(0).notNull(),
		viewsCount: integer("views_count").default(0).notNull(),
		tags: text("tags").array().notNull(),
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
		index("videos_publishedAt_idx").on(table.publishedAt),
	],
);

export const videoRelations = relations(videos, ({ one }) => ({
	user: one(user, {
		fields: [videos.userId],
		references: [user.id],
	}),
	asset: one(assets, {
		fields: [videos.assetId],
		references: [assets.id],
	}),
}));

// ================================
// Business Logic - Storyboards
// ================================
export const storyboards = pgTable("storyboards", {
	id: text("id").primaryKey(), // StoryboardId (string)

	// The full Storyboard struct lives here as JSON
	data: jsonb("data").$type<Storyboard>().notNull(),

	previewVideoAssetId: uuid("preview_video_asset_id")
		.references(() => assets.id, { onDelete: "restrict" })
		.notNull(),

	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const storyboardRelations = relations(storyboards, ({ one }) => ({
	asset: one(assets, {
		fields: [storyboards.previewVideoAssetId],
		references: [assets.id],
	}),
}));

export const assets = pgTable("assets", {
	id: uuid("id").primaryKey().defaultRandom(),
	assetType: text("asset_type", {
		enum: ["VIDEO", "IMAGE", "AUDIO"],
	}).notNull(),
	assetKey: text("asset_key").notNull(),
	// only for video
	posterKey: text("poster_key"),
	// only for video and audio
	durationSeconds: integer("duration_seconds"),
	// only for video
	resolution: jsonb("resolution").$type<{ width: number; height: number }>(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

// ================================
// Type Exports
// ================================
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Actor = typeof actors.$inferSelect;
export type NewActor = typeof actors.$inferInsert;

export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type StoryboardRecord = typeof storyboards.$inferSelect;
export type NewStoryboard = typeof storyboards.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
// ================================
