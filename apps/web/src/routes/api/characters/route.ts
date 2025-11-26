import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { Character } from "@/routes/_layout.create/-types";

export type { Character };

// Mock data - In production, fetch from database
const MOCK_CHARACTERS: Character[] = [
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

export const Route = createFileRoute("/api/characters")({
	server: {
		handlers: {
			GET: () => {
				return json({ characters: MOCK_CHARACTERS });
			},
		},
	},
});

