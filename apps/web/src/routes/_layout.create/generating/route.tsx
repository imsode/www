import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { z } from "zod";
import { GeneratingStep } from "../-components/GeneratingStep";

export const checkVideoGenerationStatus = createServerFn({ method: "GET" })
	.inputValidator((data: { generationId: string }) => data)
	.handler(async ({ data }) => {
		console.log("Checking status for generation:", data.generationId);
		await new Promise((resolve) => setTimeout(resolve, 500));

		const rand = Math.random();
		if (rand < 0.1)
			return {
				status: "completed",
				videoUrl:
					"https://videos.pexels.com/video-files/6893205/6893205-hd_1080_1920_25fps.mp4",
			};
		if (rand < 0.2) return { status: "failed" };
		return { status: "processing" };
	});

const generatingSearchSchema = z.object({
	generationId: z.string(),
});

export const Route = createFileRoute("/_layout/create/generating")({
	validateSearch: (search) => generatingSearchSchema.parse(search),
	component: GeneratingPage,
});

function GeneratingPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const { generationId } = search;

	const { data: statusData } = useQuery({
		queryKey: ["generationStatus", generationId],
		queryFn: () => checkVideoGenerationStatus({ data: { generationId } }),
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data?.status === "completed" || data?.status === "failed") {
				return false;
			}
			return 2000;
		},
	});

	useEffect(() => {
		if (statusData?.status === "completed" && statusData.videoUrl) {
			navigate({
				to: "/create/completed",
				search: {
					videoUrl: statusData.videoUrl,
				},
			});
		}
	}, [statusData, navigate]);

	return <GeneratingStep />;
}
