import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { Template } from "@/routes/_layout.create/-types";

export type { Template };

// Mock data - In production, fetch from database
const MOCK_TEMPLATES: Template[] = [
	{
		id: "1",
		name: "Winter Kiss",
		description: "Romantic winter vibes",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/manifest/video.m3u8",
		roles: ["Hero", "Partner"],
		tags: ["Romance", "12s"],
	},
	{
		id: "2",
		name: "Epic Journey",
		description: "Travel highlights",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/manifest/video.m3u8",
		roles: ["Traveler"],
		tags: ["Travel", "15s"],
	},
	{
		id: "3",
		name: "Daily Vlog",
		description: "Share your day",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/manifest/video.m3u8",
		roles: ["Host"],
		tags: ["Lifestyle", "30s"],
	},
	{
		id: "4",
		name: "Cyberpunk",
		description: "Futuristic aesthetic",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/manifest/video.m3u8",
		roles: ["Hacker", "Target"],
		tags: ["Sci-Fi", "10s"],
	},
];

export const Route = createFileRoute("/api/templates")({
	server: {
		handlers: {
			GET: () => {
				return json({ templates: MOCK_TEMPLATES });
			},
		},
	},
});

