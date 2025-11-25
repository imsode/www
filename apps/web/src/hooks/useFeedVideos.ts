import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { FeedVideo } from "@/components/VerticalVideoFeed";

type FeedPage = {
	videos: FeedVideo[];
	nextCursor: number | undefined;
};

/**
 * Fetches feed videos from the API with cursor-based pagination.
 */
async function fetchFeedVideos({
	cursor,
}: {
	cursor: number;
}): Promise<FeedPage> {
	const response = await fetch(`/api/feed?cursor=${cursor}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch feed: ${response.statusText}`);
	}

	return response.json();
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
