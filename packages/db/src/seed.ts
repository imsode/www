import { eq, like } from "drizzle-orm";
import { createDb } from "./client";
import {
	actors,
	assets,
	type NewActor,
	type NewAsset,
	type NewStoryboard,
	type NewUser,
	type NewVideo,
	storyboards,
	user,
	videos,
} from "./schema";

// Seed user IDs are prefixed with "seed_" for easy identification and cleanup
const SEED_USER_PREFIX = "seed_";
// Seed template/character IDs use fixed UUIDs for consistent relationships
const SEED_STORYBOARD_IDS = {
	romantic_dance: "00000000-0000-0000-0000-000000000001",
	action_hero: "00000000-0000-0000-0000-000000000002",
	comedy_duo: "00000000-0000-0000-0000-000000000003",
	solo_adventure: "00000000-0000-0000-0000-000000000004",
} as const;

const SEED_ACTOR_IDS = {
	emma: "00000000-0000-0000-0001-000000000001",
	liam: "00000000-0000-0000-0001-000000000002",
	sophia: "00000000-0000-0000-0001-000000000003",
	noah: "00000000-0000-0000-0001-000000000004",
	olivia: "00000000-0000-0000-0001-000000000005",
	james: "00000000-0000-0000-0001-000000000006",
	chao_cheng: "00000000-0000-0000-0001-000000000007",
} as const;

const SEED_VIDEO_IDS = {
	romantic_dance: "00000000-0000-0000-0002-000000000001",
	action_hero: "00000000-0000-0000-0002-000000000002",
	comedy_duo: "00000000-0000-0000-0002-000000000003",
	solo_adventure: "00000000-0000-0000-0002-000000000004",
} as const;

const MOCK_USERS: NewUser[] = [
	{
		id: "seed_storyteller_jane",
		name: "Jane",
		email: "jane@example.com",
		emailVerified: true,
	},
	{
		id: "seed_creative_mike",
		name: "Mike",
		email: "mike@example.com",
		emailVerified: true,
	},
	{
		id: "seed_traveler_sarah",
		name: "Sarah",
		email: "sarah@example.com",
		emailVerified: true,
	},
	{
		id: "seed_fitness_alex",
		name: "Alex",
		email: "alex@example.com",
		emailVerified: true,
	},
];

const SEED_ASSETS: NewAsset[] = [
	{
		id: SEED_ACTOR_IDS.emma,
		assetType: "IMAGE",
		assetKey: "actors/virtual/emma.jpg",
	},
	{
		id: SEED_ACTOR_IDS.chao_cheng,
		assetType: "IMAGE",
		assetKey: "actors/user/chao_cheng.jpg",
	},
	{
		id: SEED_STORYBOARD_IDS.romantic_dance,
		assetType: "VIDEO",
		assetKey:
			"storyboards/romantic_dance/replicate-prediction-bc0za4phsxrm80cttt8rcc7g7r.mp4",
		posterKey:
			"storyboards/romantic_dance/Gemini_Generated_Image_8xcs058xcs058xcs.png",
	},
	{
		id: SEED_VIDEO_IDS.romantic_dance,
		assetType: "VIDEO",
		assetKey: "videos/romantic_dance/video.mp4",
	},
	{
		id: SEED_VIDEO_IDS.action_hero,
		assetType: "VIDEO",
		assetKey: "videos/action_hero/video.mp4",
	},
	{
		id: SEED_VIDEO_IDS.comedy_duo,
		assetType: "VIDEO",
		assetKey: "videos/comedy_duo/video.mp4",
	},
	{
		id: SEED_VIDEO_IDS.solo_adventure,
		assetType: "VIDEO",
		assetKey: "videos/solo_adventure/video.mp4",
	},
];

const MOCK_STORYBOARDS: NewStoryboard[] = [
	{
		id: SEED_STORYBOARD_IDS.romantic_dance,
		data: {
			id: SEED_STORYBOARD_IDS.romantic_dance,
			title: "Romantic Kiss",
			description: "A romantic kiss between a man and a woman",
			aspectRatio: "9:16",
			scenes: [
				{
					id: "scene_1",
					storyboardId: SEED_STORYBOARD_IDS.romantic_dance,
					order: 1,
					firstFramePrompt:
						"Macro close-up of a single teardrop suspended mid-air above wet concrete, nighttime train station background blurred with neon reflections, cinematic lighting, ultra-realistic photography, shallow depth of field, rain atmosphere, vertical 9:16.",
					scenePrompt:
						"Subject: a single clear teardrop. \
Setting: rainy outdoor train station platform at night, wet concrete with neon reflections. \
Action: the tear falls in slow motion and strikes the puddle, creating a dramatic splash and expanding ripples. \
Style/Ambiance: cinematic, melancholic, ultra-realistic, high-contrast lighting, cold blue and pink neon tones. \
Camera/Composition: extreme macro close-up, locked-off camera, shallow depth of field, high-speed slow motion. \
Audio: heavy rain ambience, soft water impact sound. \
Negative: no people, no text overlays, no camera shake, no daylight. \
Duration: 5 seconds, vertical 9:16.",
					durationSeconds: 5,
					cameraStyle: "slow dolly-in",
					locationHint: "in a cozy café",
					mood: "romantic",
					audioConfig: {
						dialogue: [],
						ambienceTrackKey: "",
						sfxTrackKey: "",
					},
					roles: [],
				},
				{
					id: "scene_2",
					storyboardId: SEED_STORYBOARD_IDS.romantic_dance,
					order: 2,
					firstFramePrompt: "A romantic dance",
					scenePrompt:
						"Subject: a young man’s trembling hand holding a soaked train ticket. \
Setting: neon-lit train station platform under partial shelter at night, rain blowing in from the side. \
Action: the hand enters frame, trembles from tension, water drips off the fingers, the grip tightens and slightly crumples the ticket. \
Style/Ambiance: gritty cinematic realism, anxious mood, cold rainy atmosphere. \
Camera/Composition: tight handheld close-up with subtle micro-shake, shallow depth of field. \
Audio: rain striking metal roof, faint paper rustle, shallow breathing. \
Negative: no crowds, no readable text on ticket, no bright daylight, no extreme motion blur. \
Duration: 5 seconds, vertical 9:16.",
					durationSeconds: 10,
					cameraStyle: "slow dolly-in",
					locationHint: "in a cozy café",
					mood: "romantic",
					audioConfig: {
						dialogue: [],
						ambienceTrackKey: "",
						sfxTrackKey: "",
					},
					roles: [],
				},
			],
			roles: [
				{
					id: "role_1",
					name: "Man",
					displayName: "Man",
					description: "The man in the story",
				},
				{
					id: "role_2",
					name: "Woman",
					displayName: "Woman",
					description: "The woman in the story",
				},
			],
			tags: [],
		},
		previewVideoAssetId: SEED_STORYBOARD_IDS.romantic_dance,
	},
];

const MOCK_ACTORS: NewActor[] = [
	{
		id: SEED_ACTOR_IDS.emma,
		userId: null, // Virtual/system character
		name: "Emma",
		assetId: SEED_ACTOR_IDS.emma,
		type: "VIRTUAL" as const,
	},
];

const MOCK_VIDEOS: NewVideo[] = [
	{
		userId: "seed_storyteller_jane",
		caption: "My journey through the mountains",
		assetId: SEED_VIDEO_IDS.romantic_dance,
		likesCount: 12500,
		commentsCount: 340,
		sharesCount: 89,
		tags: ["adventure", "nature", "stories"],
	},
	{
		userId: "seed_creative_mike",
		caption: "Creating art from everyday moments",
		assetId: SEED_VIDEO_IDS.action_hero,
		likesCount: 8900,
		commentsCount: 210,
		sharesCount: 45,
		tags: ["creativity", "daily", "moments"],
	},
	{
		userId: "seed_traveler_sarah",
		caption: "Sunset vibes in Santorini",
		assetId: SEED_VIDEO_IDS.comedy_duo,
		likesCount: 15200,
		commentsCount: 456,
		sharesCount: 120,
		tags: ["travel", "greece", "sunset"],
	},
	{
		userId: "seed_fitness_alex",
		caption: "Morning workout routine",
		assetId: SEED_VIDEO_IDS.solo_adventure,
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
	const seedStoryboardIds = Object.values(SEED_STORYBOARD_IDS);
	let deletedStoryboardsCount = 0;
	for (const storyboardId of seedStoryboardIds) {
		const deleted = await db
			.delete(storyboards)
			.where(eq(storyboards.id, storyboardId))
			.returning({ id: storyboards.id });
		deletedStoryboardsCount += deleted.length;
	}
	console.log(`  ✓ Deleted ${deletedStoryboardsCount} storyboards`);

	// Delete seed virtual actors
	const seedActorIds = Object.values(SEED_ACTOR_IDS);
	let deletedActorsCount = 0;
	for (const actorId of seedActorIds) {
		const deleted = await db
			.delete(actors)
			.where(eq(actors.id, actorId))
			.returning({ id: actors.id });
		deletedActorsCount += deleted.length;
	}
	console.log(`  ✓ Deleted ${deletedActorsCount} actors`);

	// Delete seed assets
	const seedAssets = Object.values(SEED_ASSETS);
	let deletedAssetsCount = 0;
	for (const asset of seedAssets) {
		const deleted = await db
			.delete(assets)
			.where(eq(assets.id, asset.id!))
			.returning({ id: assets.id });
		deletedAssetsCount += deleted.length;
	}
	console.log(`  ✓ Deleted ${deletedAssetsCount} assets`);

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

	// Insert users
	console.log("\nCreating users...");
	for (const userData of MOCK_USERS) {
		const [insertedUser] = await db
			.insert(user)
			.values(userData)
			.onConflictDoNothing()
			.returning({ id: user.id });

		if (insertedUser) {
			console.log(`  ✓ User: ${userData.email}`);
		} else {
			console.log(`  ⊘ User already exists: ${userData.email}`);
		}
	}

	// Insert a assets
	console.log("\nCreating assets...");
	for (const assetData of SEED_ASSETS) {
		const [insertedAsset] = await db
			.insert(assets)
			.values(assetData)
			.onConflictDoNothing()
			.returning({ id: assets.id });

		if (insertedAsset) {
			console.log(`  ✓ Asset: ${assetData.assetKey}`);
		} else {
			console.log(`  ⊘ Asset already exists: ${assetData.assetKey}`);
		}
	}

	// Insert storyboards
	console.log("\nCreating storyboards...");
	for (const storyboardData of MOCK_STORYBOARDS) {
		// Insert template
		const [insertedStoryboard] = await db
			.insert(storyboards)
			.values(storyboardData)
			.onConflictDoNothing()
			.returning({ id: storyboards.id });

		if (insertedStoryboard) {
			console.log(`  ✓ Storyboard: ${storyboardData.data.title}`);
		} else {
			console.log(
				`  ⊘ Storyboard already exists: ${storyboardData.data.title}`,
			);
		}
	}

	// Insert actors
	console.log("\nCreating actors...");
	for (const actorData of MOCK_ACTORS) {
		const [insertedActor] = await db
			.insert(actors)
			.values(actorData)
			.onConflictDoNothing()
			.returning({ id: actors.id });

		if (insertedActor) {
			console.log(`  ✓ Actor: ${actorData.name} (${actorData.type})`);
		} else {
			console.log(`  ⊘ Actor already exists: ${actorData.name}`);
		}
	}
	// Insert user actors
	console.log("\nCreating user actors...");
	// 1. get user id from user table by email
	const userData = await db
		.select()
		.from(user)
		.where(eq(user.email, "chao@gmail.com"));
	if (!userData) {
		throw new Error("User not found");
	}
	// 2. insert actor with user id
	const [insertedActor] = await db
		.insert(actors)
		.values({
			id: SEED_ACTOR_IDS.chao_cheng,
			userId: userData[0].id,
			name: "Chao Cheng",
			assetId: SEED_ACTOR_IDS.chao_cheng,
			type: "USER_SELFIE" as const,
		})
		.onConflictDoNothing()
		.returning({ id: actors.id });
	if (insertedActor) {
		console.log(`  ✓ Actor: Chao Cheng (USER_SELFIE)`);
	} else {
		console.log(`  ⊘ Actor already exists: Chao Cheng`);
	}

	// Insert videos
	console.log("\nCreating videos...");
	const now = Date.now();
	for (let i = 0; i < MOCK_VIDEOS.length; i++) {
		const videoData = MOCK_VIDEOS[i];

		// Stagger publishedAt by 1 hour per video (oldest first, newest last)
		const publishedAt = new Date(now - (MOCK_VIDEOS.length - 1 - i) * 3600000);

		// Insert video and get the ID
		const [insertedVideo] = await db
			.insert(videos)
			.values({
				...videoData,
				publishedAt,
			})
			.returning({ id: videos.id });

		if (insertedVideo) {
			console.log(`  ✓ Video: "${videoData.caption.slice(0, 40)}..."`);
			console.log(`    └─ Published: ${publishedAt.toISOString()}`);
		} else {
			console.log(
				`  ⊘ Video already exists: "${videoData.caption.slice(0, 40)}..."`,
			);
		}
	}

	console.log("\n✅ Seeding complete!");
	process.exit(0);
}

seed().catch((error) => {
	console.error("❌ Seeding failed:", error);
	process.exit(1);
});
