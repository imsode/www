import { eq, like } from "drizzle-orm";
import { createDb } from "./client";
import {
	characters,
	templateRoles,
	templates,
	user,
	videos,
	videoTags,
} from "./schema";

// Seed user IDs are prefixed with "seed_" for easy identification and cleanup
const SEED_USER_PREFIX = "seed_";
// Seed template/character IDs use fixed UUIDs for consistent relationships
const SEED_TEMPLATE_IDS = {
	romantic_dance: "00000000-0000-0000-0000-000000000001",
	action_hero: "00000000-0000-0000-0000-000000000002",
	comedy_duo: "00000000-0000-0000-0000-000000000003",
	solo_adventure: "00000000-0000-0000-0000-000000000004",
} as const;

const SEED_CHARACTER_IDS = {
	emma: "00000000-0000-0000-0001-000000000001",
	liam: "00000000-0000-0000-0001-000000000002",
	sophia: "00000000-0000-0000-0001-000000000003",
	noah: "00000000-0000-0000-0001-000000000004",
	olivia: "00000000-0000-0000-0001-000000000005",
	james: "00000000-0000-0000-0001-000000000006",
} as const;

// Mock data to seed
const MOCK_USERS = [
	{
		id: "seed_storyteller_jane",
		name: "storyteller_jane",
		email: "jane@example.com",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
	},
	{
		id: "seed_creative_mike",
		name: "creative_mike",
		email: "mike@example.com",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
	},
	{
		id: "seed_traveler_sarah",
		name: "traveler_sarah",
		email: "sarah@example.com",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
	},
	{
		id: "seed_fitness_alex",
		name: "fitness_alex",
		email: "alex@example.com",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
	},
];

const MOCK_TEMPLATES = [
	{
		id: SEED_TEMPLATE_IDS.romantic_dance,
		name: "Romantic Dance",
		description:
			"A beautiful romantic dance sequence with two partners under the moonlight.",
		previewImageUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/thumbnails/thumbnail.jpg",
		previewVideoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/manifest/video.m3u8",
		providerModelId: "kling-v1-pro",
		durationSeconds: 30,
		roles: [
			{ roleName: "Lead Dancer", sortOrder: 0 },
			{ roleName: "Partner", sortOrder: 1 },
		],
	},
	{
		id: SEED_TEMPLATE_IDS.action_hero,
		name: "Action Hero",
		description:
			"An intense action sequence with a hero fighting through obstacles.",
		previewImageUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/thumbnails/thumbnail.jpg",
		previewVideoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/manifest/video.m3u8",
		providerModelId: "kling-v1-pro",
		durationSeconds: 45,
		roles: [
			{ roleName: "Hero", sortOrder: 0 },
			{ roleName: "Villain", sortOrder: 1 },
		],
	},
	{
		id: SEED_TEMPLATE_IDS.comedy_duo,
		name: "Comedy Duo",
		description:
			"A hilarious comedy sketch featuring two friends in funny situations.",
		previewImageUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/thumbnails/thumbnail.jpg",
		previewVideoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/manifest/video.m3u8",
		providerModelId: "kling-v1-standard",
		durationSeconds: 20,
		roles: [
			{ roleName: "Comedian A", sortOrder: 0 },
			{ roleName: "Comedian B", sortOrder: 1 },
		],
	},
	{
		id: SEED_TEMPLATE_IDS.solo_adventure,
		name: "Solo Adventure",
		description: "An epic solo journey through stunning landscapes.",
		previewImageUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/thumbnails/thumbnail.jpg",
		previewVideoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/manifest/video.m3u8",
		providerModelId: "kling-v1-standard",
		durationSeconds: 60,
		roles: [{ roleName: "Adventurer", sortOrder: 0 }],
	},
];

const MOCK_CHARACTERS = [
	{
		id: SEED_CHARACTER_IDS.emma,
		userId: null, // Virtual/system character
		name: "Emma",
		imageKey: "characters/virtual/emma.jpg",
		thumbnailKey: "characters/virtual/emma_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Female",
	},
	{
		id: SEED_CHARACTER_IDS.liam,
		userId: null,
		name: "Liam",
		imageKey: "characters/virtual/liam.jpg",
		thumbnailKey: "characters/virtual/liam_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Male",
	},
	{
		id: SEED_CHARACTER_IDS.sophia,
		userId: null,
		name: "Sophia",
		imageKey: "characters/virtual/sophia.jpg",
		thumbnailKey: "characters/virtual/sophia_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Female",
	},
	{
		id: SEED_CHARACTER_IDS.noah,
		userId: null,
		name: "Noah",
		imageKey: "characters/virtual/noah.jpg",
		thumbnailKey: "characters/virtual/noah_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Male",
	},
	{
		id: SEED_CHARACTER_IDS.olivia,
		userId: null,
		name: "Olivia",
		imageKey: "characters/virtual/olivia.jpg",
		thumbnailKey: "characters/virtual/olivia_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Female",
	},
	{
		id: SEED_CHARACTER_IDS.james,
		userId: null,
		name: "James",
		imageKey: "characters/virtual/james.jpg",
		thumbnailKey: "characters/virtual/james_thumb.jpg",
		type: "VIRTUAL" as const,
		category: "Male",
	},
];

const MOCK_VIDEOS = [
	{
		userId: "seed_storyteller_jane",
		caption: "My journey through the mountains 🏔️ #adventure #nature",
		videoFileKey: "041aea9dcec7a96be5dd786080756be9",
		likesCount: 12500,
		commentsCount: 340,
		sharesCount: 89,
		tags: ["adventure", "nature", "stories"],
	},
	{
		userId: "seed_creative_mike",
		caption: "Creating art from everyday moments ✨ #creativity #art",
		videoFileKey: "fbf0cf2d02ec5d6df6537cd8917b5abb",
		likesCount: 8900,
		commentsCount: 210,
		sharesCount: 45,
		tags: ["creativity", "daily", "moments"],
	},
	{
		userId: "seed_traveler_sarah",
		caption: "Sunset vibes in Santorini 🌅 #travel #greece",
		videoFileKey: "c5624ba8ba8dadb2f50a5d4e09a07489",
		likesCount: 15200,
		commentsCount: 456,
		sharesCount: 120,
		tags: ["travel", "greece", "sunset"],
	},
	{
		userId: "seed_fitness_alex",
		caption: "Morning workout routine 💪 #fitness #motivation",
		videoFileKey: "a151644ca41f371d24c5a777b2e0a087",
		likesCount: 9800,
		commentsCount: 189,
		sharesCount: 67,
		tags: ["fitness", "workout", "motivation"],
	},
];

async function cleanSeedData(db: ReturnType<typeof createDb>) {
	console.log("🧹 Cleaning existing seed data...\n");

	// Delete videos owned by seed users (cascade will handle video_tags)
	const deletedVideos = await db
		.delete(videos)
		.where(like(videos.userId, `${SEED_USER_PREFIX}%`))
		.returning({ id: videos.id });
	console.log(`  ✓ Deleted ${deletedVideos.length} videos`);

	// Delete seed users
	const deletedUsers = await db
		.delete(user)
		.where(like(user.id, `${SEED_USER_PREFIX}%`))
		.returning({ id: user.id });
	console.log(`  ✓ Deleted ${deletedUsers.length} users`);

	// Delete seed templates (cascade will handle template_roles)
	const seedTemplateIds = Object.values(SEED_TEMPLATE_IDS);
	let deletedTemplatesCount = 0;
	for (const templateId of seedTemplateIds) {
		const deleted = await db
			.delete(templates)
			.where(eq(templates.id, templateId))
			.returning({ id: templates.id });
		deletedTemplatesCount += deleted.length;
	}
	console.log(`  ✓ Deleted ${deletedTemplatesCount} templates`);

	// Delete seed virtual characters
	const seedCharacterIds = Object.values(SEED_CHARACTER_IDS);
	let deletedCharactersCount = 0;
	for (const characterId of seedCharacterIds) {
		const deleted = await db
			.delete(characters)
			.where(eq(characters.id, characterId))
			.returning({ id: characters.id });
		deletedCharactersCount += deleted.length;
	}
	console.log(`  ✓ Deleted ${deletedCharactersCount} characters`);

	console.log("");
}

async function seed() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL environment variable is required");
	}

	const shouldClean = process.argv.includes("--clean");
	const db = createDb(databaseUrl);

	if (shouldClean) {
		await cleanSeedData(db);
	}

	console.log("🌱 Seeding database...\n");

	// Insert users (upsert to avoid duplicates)
	console.log("Creating users...");
	for (const userData of MOCK_USERS) {
		await db
			.insert(user)
			.values({
				id: userData.id,
				name: userData.name,
				email: userData.email,
				emailVerified: true,
				image: userData.image,
			})
			.onConflictDoNothing();
		console.log(`  ✓ User: ${userData.name}`);
	}

	// Insert templates and their roles
	console.log("\nCreating templates...");
	for (const templateData of MOCK_TEMPLATES) {
		const { roles, ...templateFields } = templateData;

		// Insert template
		const [insertedTemplate] = await db
			.insert(templates)
			.values(templateFields)
			.onConflictDoNothing()
			.returning({ id: templates.id });

		if (insertedTemplate) {
			console.log(`  ✓ Template: ${templateData.name}`);

			// Insert roles for this template
			for (const role of roles) {
				await db
					.insert(templateRoles)
					.values({
						templateId: insertedTemplate.id,
						roleName: role.roleName,
						sortOrder: role.sortOrder,
					})
					.onConflictDoNothing();
			}
			console.log(`    └─ Roles: ${roles.map((r) => r.roleName).join(", ")}`);
		} else {
			console.log(`  ⊘ Template already exists: ${templateData.name}`);
		}
	}

	// Insert virtual characters
	console.log("\nCreating characters...");
	for (const characterData of MOCK_CHARACTERS) {
		const [insertedCharacter] = await db
			.insert(characters)
			.values(characterData)
			.onConflictDoNothing()
			.returning({ id: characters.id });

		if (insertedCharacter) {
			console.log(
				`  ✓ Character: ${characterData.name} (${characterData.category})`,
			);
		} else {
			console.log(`  ⊘ Character already exists: ${characterData.name}`);
		}
	}

	// Insert videos with staggered publishedAt timestamps for realistic pagination
	console.log("\nCreating videos...");
	const now = Date.now();
	for (let i = 0; i < MOCK_VIDEOS.length; i++) {
		const videoData = MOCK_VIDEOS[i];
		const { tags, ...videoFields } = videoData;

		// Stagger publishedAt by 1 hour per video (oldest first, newest last)
		const publishedAt = new Date(now - (MOCK_VIDEOS.length - 1 - i) * 3600000);

		// Insert video and get the ID
		const [insertedVideo] = await db
			.insert(videos)
			.values({
				...videoFields,
				visibility: "PUBLIC",
				publishedAt,
			})
			.returning({ id: videos.id });

		console.log(`  ✓ Video: "${videoData.caption.slice(0, 40)}..."`);
		console.log(`    └─ Published: ${publishedAt.toISOString()}`);

		// Insert tags for this video
		if (tags.length > 0 && insertedVideo) {
			await db.insert(videoTags).values(
				tags.map((tag) => ({
					videoId: insertedVideo.id,
					tag,
				})),
			);
			console.log(`    └─ Tags: ${tags.join(", ")}`);
		}
	}

	console.log("\n✅ Seeding complete!");
	process.exit(0);
}

seed().catch((error) => {
	console.error("❌ Seeding failed:", error);
	process.exit(1);
});
