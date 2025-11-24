import type { Character, Template } from "./-types";

export const DEMO_USER_ID = "demo-user";

export const MOCK_CHARACTERS: Character[] = [
	{
		id: "me",
		name: "Me",
		imageUrl: "", // Will be populated by fetchSelfie
		isUser: true,
	},
	{
		id: "alice",
		name: "Alice",
		imageUrl:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "john",
		name: "John",
		imageUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "emma",
		name: "Emma",
		imageUrl:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "sophia",
		name: "Sophia",
		imageUrl:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
	},
];

export const TEMPLATES: Template[] = [
	{
		id: "1",
		name: "Winter Kiss",
		description: "Romantic winter vibes",
		image:
			"https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=400&q=80",
		roles: ["Hero", "Partner"],
		tags: ["Romance", "12s"],
	},
	{
		id: "2",
		name: "Epic Journey",
		description: "Travel highlights",
		image:
			"https://images.unsplash.com/photo-1469474932796-b494551f87f4?auto=format&fit=crop&w=400&q=80",
		roles: ["Traveler"],
		tags: ["Travel", "15s"],
	},
	{
		id: "3",
		name: "Daily Vlog",
		description: "Share your day",
		image:
			"https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80",
		roles: ["Host"],
		tags: ["Lifestyle", "30s"],
	},
	{
		id: "4",
		name: "Cyberpunk",
		description: "Futuristic aesthetic",
		image:
			"https://images.unsplash.com/photo-1535378437321-6a8fd7323c65?auto=format&fit=crop&w=400&q=80",
		roles: ["Hacker", "Target"],
		tags: ["Sci-Fi", "10s"],
	},
];
