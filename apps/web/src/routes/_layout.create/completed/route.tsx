import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CompletedStep } from "../-components/CompletedStep";

const completedSearchSchema = z.object({
	videoUrl: z.string(),
});

export const Route = createFileRoute("/_layout/create/completed")({
	validateSearch: (search) => completedSearchSchema.parse(search),
	component: CompletedPage,
});

function CompletedPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	const handleRestart = () => {
		navigate({ to: "/create/characters" });
	};

	return <CompletedStep videoUrl={search.videoUrl} onRestart={handleRestart} />;
}
