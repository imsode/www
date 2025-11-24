import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CharacterSelectionStep } from "../-components/CharacterSelectionStep";
import { MOCK_CHARACTERS } from "../-constants";

const charactersSearchSchema = z.object({
	characterIds: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/_layout/create/characters")({
	validateSearch: (search) => charactersSearchSchema.parse(search),
	component: CharactersPage,
});

function CharactersPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [selectedIds, setSelectedIds] = useState<string[]>(
		search.characterIds || [],
	);

	// In a real app, we'd fetch these or pull from a shared context
	const characters = MOCK_CHARACTERS;

	const handleNext = () => {
		// Persist selection (e.g. to URL or context) - for now passing via state/URL is tricky without a store
		// We'll use search params in the next step to make it robust
		navigate({
			to: "/create/template",
			search: {
				characterIds: selectedIds,
			},
		});
	};

	return (
		<CharacterSelectionStep
			characters={characters}
			selectedIds={selectedIds}
			onSelect={setSelectedIds}
			onNext={handleNext}
			onBack={() => navigate({ to: "/" })}
		/>
	);
}
