import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { FeedVideo } from "@/components/VerticalVideoFeed";

// Mock data - In production, replace fetchFeedVideos with a real API call
const MOCK_VIDEOS: FeedVideo[] = [
	{
		id: 1,
		username: "storyteller_jane",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
		caption: "My journey through the mountains 🏔️ #adventure #nature",
		likes: 12500,
		comments: 340,
		shares: 89,
		thumbnail:
			"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/6740718/6740718-hd_1080_1920_25fps.mp4",
		tags: ["adventure", "nature", "stories"],
	},
	{
		id: 2,
		username: "creative_mike",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
		caption: "Creating art from everyday moments ✨ #creativity #art",
		likes: 8900,
		comments: 210,
		shares: 45,
		thumbnail:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/5310966/5310966-hd_1080_1920_25fps.mp4",
		tags: ["creativity", "daily", "moments"],
	},
	{
		id: 3,
		username: "traveler_sarah",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		caption: "Sunset vibes in Santorini 🌅 #travel #greece",
		likes: 15200,
		comments: 456,
		shares: 120,
		thumbnail:
			"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/6893205/6893205-hd_1080_1920_25fps.mp4",
		tags: ["travel", "greece", "sunset"],
	},
	{
		id: 4,
		username: "fitness_alex",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
		caption: "Morning workout routine 💪 #fitness #motivation",
		likes: 9800,
		comments: 189,
		shares: 67,
		thumbnail:
			"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/4536395/4536395-hd_1080_1920_25fps.mp4",
		tags: ["fitness", "workout", "motivation"],
	},
	{
		id: 5,
		username: "chef_maria",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
		caption: "Quick pasta recipe in 60 seconds 🍝 #cooking #food",
		likes: 22100,
		comments: 891,
		shares: 234,
		thumbnail:
			"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/3296396/3296396-hd_1080_1920_25fps.mp4",
		tags: ["cooking", "food", "recipe"],
	},
	{
		id: 6,
		username: "tech_david",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
		caption: "Unboxing the latest gadget 📱 #tech #review",
		likes: 7600,
		comments: 312,
		shares: 98,
		thumbnail:
			"https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/5377684/5377684-hd_1080_1920_25fps.mp4",
		tags: ["tech", "gadgets", "review"],
	},
	{
		id: 7,
		username: "nature_emma",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
		caption: "Hidden waterfall discovery 🌊 #nature #explore",
		likes: 18400,
		comments: 567,
		shares: 189,
		thumbnail:
			"https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
		tags: ["nature", "waterfall", "explore"],
	},
	{
		id: 8,
		username: "music_james",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
		caption: "Guitar cover of a classic 🎸 #music #cover",
		likes: 11200,
		comments: 423,
		shares: 156,
		thumbnail:
			"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/4488476/4488476-hd_1080_1920_25fps.mp4",
		tags: ["music", "guitar", "cover"],
	},
];

type FeedPage = {
	videos: FeedVideo[];
	nextCursor: number | undefined;
};

const PAGE_SIZE = 3;

/**
 * Fetches feed videos with cursor-based pagination.
 * Replace this function with a real API call in production.
 */
async function fetchFeedVideos({
	cursor,
}: {
	cursor: number;
}): Promise<FeedPage> {
	// Simulate network delay
	await new Promise((r) => setTimeout(r, 300));

	// For demo: cycle through mock videos to simulate infinite content
	const startIndex = cursor % MOCK_VIDEOS.length;
	const videos: FeedVideo[] = [];

	for (let i = 0; i < PAGE_SIZE; i++) {
		const sourceIndex = (startIndex + i) % MOCK_VIDEOS.length;
		const source = MOCK_VIDEOS[sourceIndex];
		// Create unique IDs for each "page" of videos
		videos.push({
			...source,
			id: cursor + i + 1,
		});
	}

	return {
		videos,
		nextCursor: cursor + PAGE_SIZE,
	};
}

export function useFeedVideos() {
	const query = useInfiniteQuery({
		queryKey: ["feed-videos"],
		queryFn: ({ pageParam }) => fetchFeedVideos({ cursor: pageParam }),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});

	// Flatten all pages into a single array
	const videos = useMemo(
		() => query.data?.pages.flatMap((page) => page.videos) ?? [],
		[query.data?.pages],
	);

	return {
		videos,
		isLoading: query.isLoading,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
	};
}
