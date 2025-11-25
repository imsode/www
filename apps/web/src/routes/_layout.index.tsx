import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	VerticalVideoFeed,
	type VideoFeedHandle,
} from "@/components/VerticalVideoFeed";
import { VideoActions } from "@/components/VideoActions";
import { useFeedVideos } from "@/hooks/useFeedVideos";

export const Route = createFileRoute("/_layout/")({ component: FeedPage });

function FeedPage() {
	const [activeVideoIndex, setActiveVideoIndex] = useState(0);
	const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
	const feedRef = useRef<VideoFeedHandle | null>(null);

	const { videos, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useFeedVideos();

	// Use ref to avoid recreating callback when fetch state changes
	const isFetchingRef = useRef(isFetchingNextPage);
	isFetchingRef.current = isFetchingNextPage;

	// Bootstrap initial video list on mount
	useEffect(() => {
		if (!isLoading && videos.length === 0 && hasNextPage) {
			fetchNextPage();
		}
	}, [isLoading, videos.length, hasNextPage, fetchNextPage]);

	const currentVideo = videos[activeVideoIndex];
	const isLiked = currentVideo ? likedVideos.has(currentVideo.id) : false;

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingRef.current) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);

	const handleLike = (videoId: number) => {
		setLikedVideos((prev) => {
			const next = new Set(prev);
			if (next.has(videoId)) {
				next.delete(videoId);
			} else {
				next.add(videoId);
			}
			return next;
		});
	};

	const goPrev = useCallback(() => {
		if (!videos.length) return;
		if (feedRef.current) {
			feedRef.current.goToPrev();
			return;
		}
		setActiveVideoIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
	}, [videos.length]);

	const goNext = useCallback(() => {
		if (!videos.length) return;
		if (feedRef.current) {
			feedRef.current.goToNext();
			return;
		}
		setActiveVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
	}, [videos.length]);

	return (
		// Use 100dvh to ensure we use the full dynamic viewport height, preventing bottom bar issues on mobile
		<div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden pb-[3.5rem] sm:pb-0">
			{/* Main Content Area */}
			<div className="flex-1 w-full overflow-hidden flex justify-center relative">
				<div className="relative w-full h-full lg:max-w-[calc(100vh*9/16)] overflow-hidden bg-black">
					<VerticalVideoFeed
						ref={feedRef}
						videos={videos}
						activeIndex={activeVideoIndex}
						onActiveIndexChange={setActiveVideoIndex}
						likedVideos={likedVideos}
						onLike={handleLike}
						onEndReached={handleEndReached}
						className="h-full w-full"
					/>
				</div>

				{/* Desktop Video Actions (Side) */}
				{currentVideo && (
					<div className="hidden lg:flex flex-col justify-end ml-4 mb-4 z-10">
						<VideoActions
							avatar={currentVideo.avatar}
							username={currentVideo.username}
							likes={currentVideo.likes}
							comments={currentVideo.comments}
							shares={currentVideo.shares}
							isLiked={isLiked}
							onLike={() => handleLike(currentVideo.id)}
							onPrev={goPrev}
							onNext={goNext}
							layout="sidebar"
							className="bg-transparent w-auto text-white/90"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
