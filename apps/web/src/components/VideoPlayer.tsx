import {
	isHLSProvider,
	MediaPlayer,
	type MediaPlayerInstance,
	MediaProvider,
	type MediaProviderAdapter,
} from "@vidstack/react";
import "@vidstack/react/player/styles/base.css";
import Hls from "hls.js";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type VideoPlayerProps = {
	/** Video source URL (MP4 or HLS manifest) */
	src: string;
	/** Poster/thumbnail image URL */
	poster?: string;
	/** Whether this video should be playing */
	isActive?: boolean;
	/** Additional class names for the player container */
	className?: string;
	/** Slot for overlay content (controls, actions, etc.) */
	children?: ReactNode;
};

/**
 * VideoPlayer wraps Vidstack MediaPlayer with HLS support and autoplay handling.
 *
 * Features:
 * - Automatic HLS.js integration for non-Safari browsers
 * - Volume state persistence via localStorage
 * - Starts muted for autoplay (browser policy), shows unmute overlay
 * - Loop playback for short-form video
 */
export function VideoPlayer({
	src,
	poster,
	isActive = false,
	className,
	children,
}: VideoPlayerProps) {
	const playerRef = useRef<MediaPlayerInstance>(null);
	const isActiveRef = useRef(isActive);
	isActiveRef.current = isActive;

	// Configure HLS.js when the provider is ready
	const onProviderChange = useCallback(
		(provider: MediaProviderAdapter | null) => {
			if (isHLSProvider(provider)) {
				provider.library = Hls;
			}
		},
		[],
	);

	// Handle play/pause based on isActive
	useEffect(() => {
		const player = playerRef.current;
		if (!player) return;

		if (isActive) {
			// Try to play, catching any errors (e.g., if not ready yet)
			player.play().catch(() => {});
		} else {
			player.pause();
		}
	}, [isActive]);

	// Also play when canPlay fires if we're supposed to be active
	const onCanPlay = useCallback(() => {
		const player = playerRef.current;
		if (player && isActiveRef.current) {
			player.play().catch(() => {});
		}
	}, []);

	return (
		<MediaPlayer
			ref={playerRef}
			src={src}
			poster={poster}
			autoPlay={isActive}
			muted
			loop
			playsInline
			storage="vidstack-volume"
			className={cn("video-player", className)}
			onProviderChange={onProviderChange}
			onCanPlay={onCanPlay}
		>
			<MediaProvider />
			{children}
		</MediaPlayer>
	);
}
