import { useMediaPlayer, useMediaStore } from "@vidstack/react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UnmuteOverlayProps = {
	className?: string;
};

/**
 * UnmuteOverlay displays a button when autoplay was blocked due to unmuted audio.
 * Users can tap to unmute the video. Uses shadcn Button for consistent styling.
 *
 * This component must be used inside a Vidstack MediaPlayer.
 */
export function UnmuteOverlay({ className }: UnmuteOverlayProps) {
	const player = useMediaPlayer();
	const { muted, canPlay } = useMediaStore();

	// Only show when video is ready but muted (likely due to autoplay policy)
	if (!canPlay || !muted) {
		return null;
	}

	const handleUnmute = () => {
		if (player) {
			player.muted = false;
		}
	};

	return (
		<div
			className={cn(
				"absolute inset-0 flex items-center justify-center",
				"pointer-events-none",
				className,
			)}
		>
			<Button
				variant="secondary"
				size="lg"
				onClick={handleUnmute}
				className={cn(
					"pointer-events-auto",
					"gap-2 rounded-full bg-black/60 text-white",
					"hover:bg-black/80 hover:text-white",
					"backdrop-blur-sm",
					"animate-in fade-in-0 zoom-in-95 duration-200",
				)}
			>
				{muted ? (
					<VolumeX className="h-5 w-5" />
				) : (
					<Volume2 className="h-5 w-5" />
				)}
				<span>Tap to unmute</span>
			</Button>
		</div>
	);
}
