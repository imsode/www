import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Home, Plus, Search, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  type FeedVideo,
  VerticalVideoFeed,
  type VideoFeedHandle,
} from "@/components/VerticalVideoFeed";
import { VideoActions } from "@/components/VideoActions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: FeedPage });

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
  const [isSearchActive, setIsSearchActive] = useState(false);
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
      prev === 0 ? mockVideos.length - 1 : prev - 1
    );
  }, []);

  const goNext = useCallback(() => {
    if (feedRef.current) {
      feedRef.current.goToNext();
      return;
    }
    setActiveVideoIndex((prev) =>
      prev === mockVideos.length - 1 ? 0 : prev + 1
    );
  }, []);

  return (
    // Use 100dvh to ensure we use the full dynamic viewport height, preventing bottom bar issues on mobile
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden">
      {/* Header: Absolute on mobile to overlay video, standard on desktop */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-transparent bg-gradient-to-b from-black/80 to-transparent text-white px-4 py-3 sm:relative sm:bg-black sm:border-b sm:border-white/10">
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Search Mode */}
          <div
            className={cn(
              "flex items-center gap-3 w-full md:hidden",
              isSearchActive ? "flex" : "hidden"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSearchActive(false)}
              aria-label="Exit search"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <SearchBar className="flex-1" autoFocus />
          </div>

          {/* Default Mode */}
          <div
            className={cn(
              "contents",
              isSearchActive ? "hidden md:flex" : "flex"
            )}
          >
            <SidebarTrigger
              className={cn(
                "rounded-full border border-white/50 text-white hover:bg-white/10"
              )}
            />
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-3",
            isSearchActive ? "hidden md:flex" : "flex"
          )}
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-full bg-gray-900 text-white hover:bg-gray-800 md:hidden"
            onClick={() => setIsSearchActive(true)}
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="secondary"
              className="flex items-center gap-2 rounded-full bg-white/10 text-white hover:bg-white/20 border-none"
              asChild
            >
              <Link to="/create">
                <Upload className="h-4 w-4" />
                Create
              </Link>
            </Button>
            <button
              type="button"
              className="rounded-full border-none p-2 text-white hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
            </button>
            <Avatar className="h-9 w-9 border border-white/20">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

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

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden shrink-0 z-20 border-t border-white/10 bg-black px-5 py-2 text-white">
        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-4 text-center">
          <button
            type="button"
            className="flex flex-col items-center text-xs font-semibold text-white/60 transition hover:text-white"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </button>

          <Link
            to="/create"
            className="flex flex-col items-center text-xs font-semibold text-white/60 transition hover:text-white"
          >
            <Plus className="h-8 w-8" />
          </Link>

          <button
            type="button"
            className="flex flex-col items-center text-xs font-semibold text-white/60 transition hover:text-white"
            aria-label="You"
          >
            <Avatar className="h-6 w-6 border border-white/20 shadow-sm">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-xs">You</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
