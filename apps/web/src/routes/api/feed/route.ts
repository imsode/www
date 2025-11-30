import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { assets, user, videos } from "@repo/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { and, desc, eq, inArray, isNotNull, lt, or } from "drizzle-orm";

export type FeedVideo = {
	id: string;
	username: string;
	avatar: string;
	caption: string;
	likes: number;
	comments: number;
	shares: number;
	thumbnail: string;
	videoUrl: string;
	tags: string[];
};

export type FeedPage = {
	videos: FeedVideo[];
	nextCursor: string | undefined;
};

// Cursor format: {timestamp}_{id} for stable pagination
function encodeCursor(publishedAt: Date, id: string): string {
	return `${publishedAt.getTime()}_${id}`;
}

function decodeCursor(
	cursor: string,
): { publishedAt: Date; id: string } | null {
	const [timestampStr, id] = cursor.split("_");
	const timestamp = Number(timestampStr);
	if (Number.isNaN(timestamp) || !id) return null;
	return { publishedAt: new Date(timestamp), id };
}

const CLOUDFLARE_STREAM_BASE_URL =
	"https://customer-nmxs5753a01mt0tb.cloudflarestream.com";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/api/feed")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const db = createDb(env.HYPERDRIVE.connectionString);
				const url = new URL(request.url);
				const cursorParam = url.searchParams.get("cursor");

				// Build where conditions
				// Only show published videos (with a publishedAt date) that are public
				const conditions = [isNotNull(videos.publishedAt)];

				// Parse cursor and add pagination condition
				if (cursorParam) {
					const cursor = decodeCursor(cursorParam);
					if (cursor) {
						// Get items where:
						// - publishedAt < cursor.publishedAt, OR
						// - publishedAt = cursor.publishedAt AND id < cursor.id
						const paginationCondition = or(
							lt(videos.publishedAt, cursor.publishedAt),
							and(
								eq(videos.publishedAt, cursor.publishedAt),
								lt(videos.id, cursor.id),
							),
						);
						if (paginationCondition) {
							conditions.push(paginationCondition);
						}
					}
				}

				// Query videos with user info, ordered by publishedAt descending
				const videoResults = await db
					.select({
						id: videos.id,
						userId: videos.userId,
						caption: videos.caption,
						assetKey: assets.assetKey,
						posterKey: assets.posterKey,
						likesCount: videos.likesCount,
						commentsCount: videos.commentsCount,
						sharesCount: videos.sharesCount,
						publishedAt: videos.publishedAt,
						userName: user.name,
						userImage: user.image,
						tags: videos.tags,
					})
					.from(videos)
					.innerJoin(user, eq(videos.userId, user.id))
					.innerJoin(assets, eq(videos.assetId, assets.id))
					.where(and(...conditions))
					.orderBy(desc(videos.publishedAt), desc(videos.id))
					.limit(PAGE_SIZE + 1); // Fetch one extra to determine if there's more

				// Check if there are more results
				const hasMore = videoResults.length > PAGE_SIZE;
				const videosToReturn = hasMore
					? videoResults.slice(0, PAGE_SIZE)
					: videoResults;

				// Transform to FeedVideo format
				const feedVideos: FeedVideo[] = videosToReturn.map((video) => ({
					id: video.id,
					username: video.userName,
					avatar:
						video.userImage ||
						`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(video.userName)}`,
					caption: video.caption || "",
					likes: video.likesCount,
					comments: video.commentsCount,
					shares: video.sharesCount,
					thumbnail: video.posterKey
						? `${CLOUDFLARE_STREAM_BASE_URL}/${video.posterKey}`
						: `${CLOUDFLARE_STREAM_BASE_URL}/${video.assetKey}/thumbnails/thumbnail.jpg`,
					videoUrl: `${CLOUDFLARE_STREAM_BASE_URL}/${video.assetKey}/manifest/video.m3u8`,
					tags: video.tags,
				}));

				// Build next cursor from the last video
				// publishedAt is guaranteed non-null by the isNotNull filter in the query
				let nextCursor: string | undefined;
				if (hasMore) {
					const lastVideo = videosToReturn[videosToReturn.length - 1];
					if (lastVideo?.publishedAt) {
						nextCursor = encodeCursor(lastVideo.publishedAt, lastVideo.id);
					}
				}

				const response: FeedPage = {
					videos: feedVideos,
					nextCursor,
				};

				return json(response);
			},
		},
	},
});
