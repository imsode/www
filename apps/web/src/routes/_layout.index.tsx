import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
	type FeedVideo,
	VerticalVideoFeed,
	type VideoFeedHandle,
} from "@/components/VerticalVideoFeed";
import { VideoActions } from "@/components/VideoActions";

export const Route = createFileRoute("/_layout/")({ component: FeedPage });

const mockVideos: FeedVideo[] = [
	{
		id: 1,
		username: "storyteller_jane",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
		caption: "My journey through the mountains 🏔️ #adventure #nature",
		likes: 12500,
		comments: 340,
		shares: 89,
		thumbnail:
			"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/6740718/6740718-hd_1080_1920_25fps.mp4",
		tags: ["adventure", "nature", "stories"],
	},
	{
		id: 2,
		username: "creative_mike",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
		caption: "Creating art from everyday moments ✨ #creativity #art",
		likes: 8900,
		comments: 210,
		shares: 45,
		thumbnail:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/5310966/5310966-hd_1080_1920_25fps.mp4",
		tags: ["creativity", "daily", "moments"],
	},
	{
		id: 3,
		username: "traveler_sarah",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		caption: "Sunset vibes in Santorini 🌅 #travel #greece",
		likes: 15200,
		comments: 456,
		shares: 120,
		thumbnail:
			"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
		videoUrl:
			"https://videos.pexels.com/video-files/6893205/6893205-hd_1080_1920_25fps.mp4",
		tags: ["travel", "greece", "sunset"],
	},
];

function FeedPage() {
	const [activeVideoIndex, setActiveVideoIndex] = useState(0);
	const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set([2]));
	const feedRef = useRef<VideoFeedHandle | null>(null);

	const currentVideo = mockVideos[activeVideoIndex];
	const isLiked = currentVideo ? likedVideos.has(currentVideo.id) : false;

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
		if (feedRef.current) {
			feedRef.current.goToPrev();
			return;
		}
		setActiveVideoIndex((prev) =>
			prev === 0 ? mockVideos.length - 1 : prev - 1,
		);
	}, []);

	const goNext = useCallback(() => {
		if (feedRef.current) {
			feedRef.current.goToNext();
			return;
		}
		setActiveVideoIndex((prev) =>
			prev === mockVideos.length - 1 ? 0 : prev + 1,
		);
	}, []);

	return (
		// Use 100dvh to ensure we use the full dynamic viewport height, preventing bottom bar issues on mobile
		<div className="flex flex-col h-full bg-black text-white overflow-hidden">
			{/* Main Content Area */}
			<div className="flex-1 w-full overflow-hidden flex justify-center relative">
				<div className="relative w-full h-full lg:max-w-[calc(100vh*9/16)] overflow-hidden bg-black">
					<VerticalVideoFeed
						ref={feedRef}
						videos={mockVideos}
						activeIndex={activeVideoIndex}
						onActiveIndexChange={setActiveVideoIndex}
						likedVideos={likedVideos}
						onLike={handleLike}
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
