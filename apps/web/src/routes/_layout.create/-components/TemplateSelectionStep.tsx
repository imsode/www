import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowRight, Check, ChevronLeft, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";
import type { Storyboard } from "../-types";

interface TemplateSelectionStepProps {
	storyboards: Storyboard[];
	selectedStoryboardId: string | null;
	onSelect: (id: string) => void;
	onNext: (storyboardId?: string) => void;
	onBack?: () => void;
	onCancel?: () => void;
}

interface MobileTemplateFeedProps {
	storyboards: Storyboard[];
	onSelect: (id: string) => void;
	onNext: (storyboardId?: string) => void;
	onBack?: () => void;
	onCancel?: () => void;
}

const TemplateTags = ({ tags }: { tags: string[] }) => (
	<div className="flex gap-2 mb-4">
		{tags.map((tag) => (
			<span
				key={tag}
				className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
			>
				{tag}
			</span>
		))}
	</div>
);

const MobileTemplateFeed = ({
	storyboards,
	onSelect,
	onNext,
	onBack,
	onCancel,
}: MobileTemplateFeedProps) => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	// Clamp activeIndex when templates array length changes
	useEffect(() => {
		// Use functional update to read current activeIndex without adding it as dependency
		setActiveIndex((prev) => {
			if (storyboards.length > 0 && prev >= storyboards.length) {
				return storyboards.length - 1;
			}
			return prev;
		});
	}, [storyboards.length]);

	// Initial estimate using window height
	const [rowHeight, setRowHeight] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerHeight;
		}
		return 800;
	});

	// Measure the actual container height
	useEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { height } = entry.contentRect;
				setRowHeight((prev) => (Math.abs(prev - height) > 1 ? height : prev));
			}
		});

		observer.observe(parent);
		return () => observer.disconnect();
	}, []);

	const virtualizer = useVirtualizer({
		count: storyboards.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan: 1,
	});

	// Detect active template based on scroll position
	// Note: virtualizer.scrollOffset triggers re-renders when scroll changes
	const scrollOffset = virtualizer.scrollOffset ?? 0;
	useEffect(() => {
		if (!storyboards.length) return;

		// Get virtualItems inside effect to avoid stale reference issues
		const items = virtualizer.getVirtualItems();
		if (!items.length) return;

		const viewportSize = parentRef.current?.clientHeight || 0;
		const center = scrollOffset + viewportSize / 2;

		let centeredIndex: number | null = null;
		for (const item of items) {
			if (center >= item.start && center < item.end) {
				centeredIndex = item.index;
				break;
			}
		}

		if (centeredIndex != null && centeredIndex < storyboards.length) {
			setActiveIndex((prev) => (prev !== centeredIndex ? centeredIndex : prev));
		}
	}, [scrollOffset, storyboards.length, virtualizer]);

	// Get virtualItems for rendering (this is fine outside useEffect)
	const virtualItems = virtualizer.getVirtualItems();

	if (!storyboards.length) {
		return (
			<div className="flex w-full h-full items-center justify-center bg-black text-white">
				<p className="text-sm font-semibold text-white/60">
					No storyboards available.
				</p>
			</div>
		);
	}

	return (
		<div className="block sm:hidden flex-1 relative h-[100dvh]">
			{onBack && (
				<button
					type="button"
					onClick={onBack}
					className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 shadow-lg active:scale-95 transition-all"
					aria-label="Go back"
				>
					<ChevronLeft className="w-6 h-6" />
				</button>
			)}
			{onCancel && (
				<button
					type="button"
					onClick={onCancel}
					className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 shadow-lg active:scale-95 transition-all"
					aria-label="Cancel"
				>
					<X className="w-6 h-6" />
				</button>
			)}

			<div
				ref={parentRef}
				className="relative w-full h-full overflow-y-auto bg-black snap-y snap-mandatory scrollbar-hide"
			>
				<div
					style={{
						height: virtualizer.getTotalSize(),
						width: "100%",
						position: "relative",
					}}
				>
					{virtualItems.map((virtualRow) => {
						const storyboard = storyboards[virtualRow.index];
						if (!storyboard) return null;

						const isActive = virtualRow.index === activeIndex;
						// Only mount VideoPlayer for items near the active index
						const isNearActive = Math.abs(virtualRow.index - activeIndex) <= 1;

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
								<div className="relative w-full h-full bg-black">
									{isNearActive ? (
										<VideoPlayer
											src={storyboard.previewVideoUrl}
											poster={storyboard.previewImageUrl}
											isActive={isActive}
											className="absolute inset-0 w-full h-full object-cover opacity-80"
										/>
									) : (
										<img
											src={storyboard.previewImageUrl}
											alt={storyboard.name}
											className="absolute inset-0 w-full h-full object-cover opacity-80"
										/>
									)}

									{/* Gradient overlay */}
									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />

									{/* Template Info */}
									<div className="absolute inset-0 flex flex-col justify-end p-6 pb-24 pointer-events-none">
										<h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
											{storyboard.name}
										</h3>
										<TemplateTags tags={storyboard.tags} />
										<p className="text-white/80 mb-4">
											{storyboard.description}
										</p>
										<div className="text-white/60 text-sm">
											Requires: {storyboard.roles.map((r) => r.name).join(", ")}
										</div>
									</div>

									{/* Action Button */}
									<div className="absolute bottom-6 left-6 right-6">
										<Button
											type="button"
											onClick={() => {
												onSelect(storyboard.id);
												onNext(storyboard.id);
											}}
											className="w-full rounded-full bg-white text-black hover:bg-white/90"
											size="lg"
										>
											Use This Template
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

interface TemplateCardProps {
	storyboard: Storyboard;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onHover?: (id: string | null) => void;
}

const TemplateCard = ({
	storyboard,
	isSelected,
	onSelect,
	onHover,
}: TemplateCardProps) => {
	// Cards show poster only - video plays in the stage preview on hover
	return (
		<button
			type="button"
			onClick={() => onSelect(storyboard.id)}
			onMouseEnter={() => onHover?.(storyboard.id)}
			onMouseLeave={() => onHover?.(null)}
			className={cn(
				"group relative w-full aspect-[9/16] rounded-xl overflow-hidden border-2 text-left transition-all",
				isSelected
					? "border-white ring-2 ring-white/20 shadow-xl scale-[1.02]"
					: "border-transparent hover:border-white/30 hover:shadow-lg opacity-80 hover:opacity-100",
				"bg-zinc-900", // Dark card background
			)}
		>
			<img
				src={storyboard.previewImageUrl}
				alt={storyboard.name}
				className="absolute inset-0 w-full h-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity" />

			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-lg animate-in zoom-in">
					<Check className="w-4 h-4" />
				</div>
			)}

			{/* Play Icon Hint */}
			{!isSelected && (
				<div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Play className="w-3 h-3 fill-current" />
				</div>
			)}

			<div className="absolute bottom-0 left-0 p-4 w-full">
				<h4 className="text-white font-bold truncate text-lg mb-1">
					{storyboard.name}
				</h4>
				<div className="flex flex-wrap gap-2">
					<span className="text-white/90 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
						{storyboard.roles.length} Roles
					</span>
					{storyboard.tags.slice(0, 2).map((tag) => (
						<span
							key={tag}
							className="text-white/70 text-xs border border-white/20 px-2 py-0.5 rounded-full"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</button>
	);
};

export function TemplateSelectionStep({
	storyboards,
	selectedStoryboardId,
	onSelect,
	onNext,
	onBack,
	onCancel,
}: TemplateSelectionStepProps) {
	// State for the active preview (hovered or selected)
	const [hoveredStoryboardId, setHoveredStoryboardId] = useState<string | null>(
		null,
	);
	const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Debounced hover handler to prevent rapid source changes from breaking Vidstack
	const handleHover = (storyboardId: string | null) => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
		// Small delay to debounce rapid hover changes
		hoverTimeoutRef.current = setTimeout(() => {
			setHoveredStoryboardId(storyboardId);
		}, 50);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	// Determine which template to show in the large preview
	const activeStoryboardId =
		hoveredStoryboardId || selectedStoryboardId || storyboards[0]?.id;
	const activeStoryboard = storyboards.find((s) => s.id === activeStoryboardId);

	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Mobile View: Full Screen Vertical Feed */}
			<div className="lg:hidden w-full h-full">
				<MobileTemplateFeed
					storyboards={storyboards}
					onSelect={onSelect}
					onNext={onNext}
					onBack={onBack}
					onCancel={onCancel}
				/>
			</div>

			{/* Desktop View: Sora-style Absolute Layout */}
			<div className="hidden lg:flex w-full h-full relative bg-black">
				{/* 1. The Stage (Left) - Flex-1 but padded to respect absolute sidebar */}
				<div className="flex-1 h-full flex items-center justify-center pr-[420px] relative">
					{activeStoryboard && (
						<div className="relative h-full p-4 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950">
							{/* No key prop - let Vidstack handle source changes internally to avoid unmount/mount race conditions */}
							<VideoPlayer
								src={activeStoryboard.previewVideoUrl}
								poster={activeStoryboard.previewImageUrl}
								isActive={true}
								className="w-full h-full object-cover"
							/>
							{/* Cinematic Info Overlay */}
							<div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500">
								<h2 className="text-white text-3xl font-bold drop-shadow-md">
									{activeStoryboard.name}
								</h2>
								<p className="text-white/80 mt-2 line-clamp-2 text-lg">
									{activeStoryboard.description}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* 2. The Inspector (Right) - Absolute Positioned */}
				<div className="absolute right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-20">
					{/* Header */}
					<div className="p-6 border-b border-white/10 bg-zinc-900 z-10">
						<h2 className="text-xl font-bold text-white mb-1">Choose Style</h2>
						<p className="text-zinc-400 text-sm">Select a template to start</p>
					</div>

					{/* Scrollable Grid */}
					<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
						<div className="grid grid-cols-2 gap-3">
							{storyboards.map((storyboard) => (
								<div key={storyboard.id}>
									<TemplateCard
										storyboard={storyboard}
										onSelect={onSelect}
										isSelected={selectedStoryboardId === storyboard.id}
										onHover={handleHover}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Footer Actions */}
					<div className="p-6 border-t border-white/10 bg-zinc-900 z-10">
						<div className="flex items-center gap-3">
							{onBack && (
								<Button
									type="button"
									variant="ghost"
									onClick={onBack}
									className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full px-6"
								>
									Back
								</Button>
							)}
							<Button
								type="button"
								onClick={() => onNext()}
								disabled={!selectedStoryboardId}
								className="flex-1 rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12"
							>
								Continue <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
