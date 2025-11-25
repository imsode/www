import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export type FeedVideo = {
	id: number;
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
	nextCursor: number | undefined;
};

// Mock data - In production, fetch from database
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
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/041aea9dcec7a96be5dd786080756be9/thumbnails/thumbnail.jpg",
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
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/fbf0cf2d02ec5d6df6537cd8917b5abb/thumbnails/thumbnail.jpg",
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
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/c5624ba8ba8dadb2f50a5d4e09a07489/thumbnails/thumbnail.jpg",
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
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/a151644ca41f371d24c5a777b2e0a087/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://replicate.delivery/xezq/rXtBWnSju7KCEdW1Ru8h9otlNe0y7YCmgbcMHxxSGstWPz1KA/tmp7fps4y65.mp4",
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

const PAGE_SIZE = 3;

export const Route = createFileRoute("/api/feed")({
	server: {
		handlers: {
			GET: ({ request }) => {
				const url = new URL(request.url);
				const cursorParam = url.searchParams.get("cursor");
				const cursor = cursorParam ? parseInt(cursorParam, 10) : 0;

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

				const response: FeedPage = {
					videos,
					nextCursor: cursor + PAGE_SIZE,
				};

				return json(response);
			},
		},
	},
});

