import { like } from "drizzle-orm";
import { createDb } from "./client";
import { user, videos, videoTags } from "./schema";

// Seed user IDs are prefixed with "seed_" for easy identification and cleanup
const SEED_USER_PREFIX = "seed_";

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
