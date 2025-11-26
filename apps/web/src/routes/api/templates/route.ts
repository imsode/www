import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { Template, TemplateRole } from "@/routes/_layout.create/-types";

export type { Template, TemplateRole };

// Mock data - In production, fetch from database
const MOCK_TEMPLATES: Template[] = [
	{
		id: "9f3c7b6e-5d7a-4a0f-9e3c-1b0bda2f5c42",
		name: "Winter Kiss",
		description: "Romantic winter vibes",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/e19a11c90dc60868439e30758a223ebc/manifest/video.m3u8",
		roles: [
			{ id: "role-1-hero", name: "Hero" },
			{ id: "role-1-partner", name: "Partner" },
		],
		tags: ["Romance", "12s"],
	},
	{
		id: "3a6d1f92-2d8e-4c51-9a4d-8f5b6c1e7d90",
		name: "Epic Journey",
		description: "Travel highlights",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/b678c99cb4be4eecbe398063706b0e56/manifest/video.m3u8",
		roles: [{ id: "role-2-traveler", name: "Traveler" }],
		tags: ["Travel", "15s"],
	},
	{
		id: "b1f84a2c-0c3e-4a0a-8d97-6d2f5e9c44ab",
		name: "Daily Vlog",
		description: "Share your day",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/d1bf534cb4c1917046adcdbf6a638ffa/manifest/video.m3u8",
		roles: [{ id: "role-3-host", name: "Host" }],
		tags: ["Lifestyle", "30s"],
	},
	{
		id: "e7c92b41-8f3d-4c1a-91b5-2a6f0d9c8e73",
		name: "Cyberpunk",
		description: "Futuristic aesthetic",
		image:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/thumbnails/thumbnail.jpg",
		videoUrl:
			"https://customer-nmxs5753a01mt0tb.cloudflarestream.com/6e90e37f2ec336c0c355589a3c4f2374/manifest/video.m3u8",
		roles: [
			{ id: "role-4-hacker", name: "Hacker" },
			{ id: "role-4-target", name: "Target" },
		],
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
