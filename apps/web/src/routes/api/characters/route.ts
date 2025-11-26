import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { Character } from "@/routes/_layout.create/-types";

export type { Character };

// Mock data - In production, fetch from database
const MOCK_CHARACTERS: Character[] = [
	{
		id: "2c4b9f3e-8d61-4a7f-b2e9-0c5a1d7f6e42",
		name: "Me",
		imageUrl: "", // Will be populated by fetchSelfie
		isUser: true,
	},
	{
		id: "71a3d6f9-5b8c-4e2a-9f41-3c0d2b6e8a57",
		name: "Alice",
		imageUrl:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "c8d2f1a7-4b9e-4c63-8a5f-0e3d9b2c1f64",
		name: "John",
		imageUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "5e1f9c2a-7d4b-4a86-b8e3-6c0d1f2a9e47",
		name: "Emma",
		imageUrl:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "a6b3f8c1-9e2d-4f7a-8c54-2d1e0b9a6f35",
		name: "Sophia",
		imageUrl:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
	},
];

export const Route = createFileRoute("/api/characters")({
	server: {
		handlers: {
			GET: () => {
				return json({ characters: MOCK_CHARACTERS });
			},
		},
	},
});
