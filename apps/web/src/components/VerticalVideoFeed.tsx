import { useVirtualizer } from "@tanstack/react-virtual";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import { UnmuteOverlay } from "@/components/UnmuteOverlay";
import { VideoActions } from "@/components/VideoActions";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";

export type FeedVideo = {
	id: number;
	username: string;
	avatar: string;
	caption: string;
	likes: number;
	comments: number;
	shares: number;
	thumbnail: string;
	videoUrl: string;
	tags: string[];
};

export type VideoFeedHandle = {
	goToPrev: () => void;
	goToNext: () => void;
};

export type VerticalVideoFeedProps = {
	videos: FeedVideo[];
	activeIndex: number;
	onActiveIndexChange: (index: number) => void;
	likedVideos: Set<number>;
	onLike: (videoId: number) => void;
	onEndReached?: () => void;
	className?: string;
};

export const VerticalVideoFeed = forwardRef<
	VideoFeedHandle,
	VerticalVideoFeedProps
>(function VerticalVideoFeed(
	{
		videos,
		activeIndex,
		onActiveIndexChange,
		likedVideos,
		onLike,
		onEndReached,
		className,
	},
	ref,
) {
	const parentRef = useRef<HTMLDivElement | null>(null);

	// Initial estimate using window height to reduce initial shift
	// Account for mobile bottom nav (3.5rem = 56px) on small screens
	const [rowHeight, setRowHeight] = useState(() => {
		if (typeof window !== "undefined") {
			const isMobile = window.innerWidth < 640; // sm breakpoint
			return window.innerHeight - (isMobile ? 56 : 0);
		}
		return 800;
	});

	// Measure the actual container height to determine rowHeight for the virtualizer
	useEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { height } = entry.contentRect;
				// Update rowHeight if it changed significantly (more than 1px)
				setRowHeight((prev) => (Math.abs(prev - height) > 1 ? height : prev));
			}
		});

		observer.observe(parent);
		return () => observer.disconnect();
	}, []);

	const virtualizer = useVirtualizer({
		count: videos.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan: 1,
	});

	const virtualItems = virtualizer.getVirtualItems();

	const scrollToVideo = useCallback(
		(targetIndex: number, behavior: ScrollBehavior = "smooth") => {
			if (!videos.length) return;
			const parent = parentRef.current;
			if (!parent) return;

			const maxIndex = videos.length - 1;
			const nextIndex = Math.max(0, Math.min(maxIndex, targetIndex));
			const targetOffset = nextIndex * rowHeight;

			parent.scrollTo({
				top: targetOffset,
				behavior,
			});
		},
		[rowHeight, videos.length],
	);

	// Scroll to active index when it changes externally
	useEffect(() => {
		scrollToVideo(activeIndex, "auto");
	}, [activeIndex, scrollToVideo]);

	// Detect active video based on scroll position
	useEffect(() => {
		if (!virtualItems.length || !videos.length) return;

		const scrollOffset = virtualizer.scrollOffset || 0;
		const viewportSize = parentRef.current?.clientHeight || 0;
		const center = scrollOffset + viewportSize / 2;

		let centeredIndex: number | null = null;
		for (const item of virtualItems) {
			if (center >= item.start && center < item.end) {
				centeredIndex = item.index;
				break;
			}
		}

		if (
			centeredIndex != null &&
			centeredIndex !== activeIndex &&
			centeredIndex < videos.length
		) {
			onActiveIndexChange(centeredIndex);
		}
	}, [
		virtualItems,
		virtualizer.scrollOffset,
		activeIndex,
		onActiveIndexChange,
		videos.length,
	]);

	// Trigger onEndReached when approaching the end of the list
	useEffect(() => {
		if (
			videos.length >= 3 &&
			activeIndex >= videos.length - 3 &&
			onEndReached
		) {
			onEndReached();
		}
	}, [activeIndex, videos.length, onEndReached]);

	const handlePrev = useCallback(() => {
		scrollToVideo(activeIndex - 1);
	}, [activeIndex, scrollToVideo]);

	const handleNext = useCallback(() => {
		scrollToVideo(activeIndex + 1);
	}, [activeIndex, scrollToVideo]);

	useImperativeHandle(
		ref,
		() => ({
			goToPrev: handlePrev,
			goToNext: handleNext,
		}),
		[handlePrev, handleNext],
	);

	if (!videos.length) {
		return (
			<div
				className={cn(
					"flex w-full items-center justify-center bg-black/80 text-white",
					className,
				)}
			>
				<p className="text-sm font-semibold text-white/60">
					Stories will appear here soon.
				</p>
			</div>
		);
	}

	return (
		<div
			ref={parentRef}
			className={cn(
				"relative w-full overflow-y-auto bg-black snap-y snap-mandatory",
				"scrollbar-hide",
				className,
			)}
		>
			<div
				style={{
					height: virtualizer.getTotalSize(),
					width: "100%",
					position: "relative",
				}}
			>
				{virtualItems.map((virtualRow) => {
					const video = videos[virtualRow.index];
					if (!video) return null;

					const isVideoLiked = likedVideos.has(video.id);
					const isActive = virtualRow.index === activeIndex;
					// Only mount VideoPlayer for items near the active index
					const isNearActive = Math.abs(virtualRow.index - activeIndex) <= 2;

					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							className="snap-start snap-always"
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${rowHeight}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<div className="relative h-full w-full overflow-hidden bg-black">
								{isNearActive ? (
									<VideoPlayer
										src={video.videoUrl}
										poster={video.thumbnail}
										isActive={isActive}
									>
										<UnmuteOverlay />
									</VideoPlayer>
								) : (
									// Show poster only for distant videos
									<img
										src={video.thumbnail}
										alt={video.caption}
										className="h-full w-full object-cover"
									/>
								)}

								{/* Gradient overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

								{/* Video Info Overlay */}
								<div className="absolute bottom-0 left-0 right-0 p-4 pb-8 space-y-2 text-white z-10 bg-gradient-to-t from-black/60 to-transparent">
									<p className="text-base font-semibold">{video.caption}</p>
									<div className="flex flex-wrap gap-2 text-sm text-white/80">
										{video.tags.map((tag) => (
											<span key={`${video.id}-${tag}`}>#{tag}</span>
										))}
									</div>
								</div>

								<VideoActions
									avatar={video.avatar}
									username={video.username}
									likes={video.likes}
									comments={video.comments}
									shares={video.shares}
									isLiked={isVideoLiked}
									layout="overlay"
									onLike={() => onLike(video.id)}
									onPrev={handlePrev}
									onNext={handleNext}
									className="lg:hidden z-20"
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
});

VerticalVideoFeed.displayName = "VerticalVideoFeed";
