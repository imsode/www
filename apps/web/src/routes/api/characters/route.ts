import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { characters } from "@repo/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { asc, eq, isNull, or } from "drizzle-orm";
import auth from "@/lib/auth/auth";
import type { Character } from "@/routes/_layout.create/-types";

export type { Character };

// For now, use placeholder images for virtual characters
// In production, this would be a proper asset URL builder
const PLACEHOLDER_IMAGE_BASE = "https://api.dicebear.com/7.x/avataaars/svg";

export const Route = createFileRoute("/api/characters")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const db = createDb(env.HYPERDRIVE.connectionString);

				// Check for authenticated user (optional - don't require auth)
				const session = await auth(env).api.getSession({
					headers: request.headers,
				});
				const userId = session?.user?.id;

				// Build query conditions:
				// - Always include virtual characters (userId IS NULL)
				// - If authenticated, also include user's own selfies
				const conditions = userId
					? or(isNull(characters.userId), eq(characters.userId, userId))
					: isNull(characters.userId);

				const characterResults = await db
					.select({
						id: characters.id,
						name: characters.name,
						imageKey: characters.imageKey,
						type: characters.type,
					})
					.from(characters)
					.where(conditions)
					.orderBy(asc(characters.name));

				// Transform to Character format
				const charactersResponse: Character[] = characterResults.map(
					(character) => ({
						id: character.id,
						name: character.name,
						// Use dicebear as placeholder since imageKey is a storage key
						// In production, you'd convert imageKey to a proper URL
						imageUrl: `${PLACEHOLDER_IMAGE_BASE}?seed=${encodeURIComponent(character.name)}`,
						isUser: character.type === "USER_SELFIE",
					}),
				);

				return json({ characters: charactersResponse });
			},
		},
	},
});
