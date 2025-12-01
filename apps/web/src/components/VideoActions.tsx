import {
	ChevronDown,
	ChevronUp,
	Heart,
	MessageCircle,
	Share2,
	Sparkles,
} from "lucide-react";
import type { ElementType } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionConfig = {
	key: string;
	label: string | number;
	Icon: ElementType;
	onClick?: () => void;
	getIconClass: (variant: "overlay" | "sidebar") => string;
	highlight?: boolean;
};

type VideoActionsProps = {
	avatar: string;
	username: string;
	likes: number;
	comments: number;
	shares: number;
	isLiked: boolean;
	layout?: "overlay" | "sidebar";
	onLike: () => void;
	onPrev: () => void;
	onNext: () => void;
	className?: string;
	// For Remake feature
	storyboardId?: string;
	onRemake?: () => void;
};

export function VideoActions({
	avatar,
	username,
	likes,
	comments,
	shares,
	isLiked,
	layout = "sidebar",
	onLike,
	onPrev,
	onNext,
	className,
	storyboardId,
	onRemake,
}: VideoActionsProps) {
	const isOverlay = layout === "overlay";

	const layoutStyles = {
		overlay: {
			container:
				"absolute right-4 bottom-24 z-10 flex flex-col items-center gap-6 text-xs font-semibold text-white",
			actionWrapper: "flex flex-col items-center gap-4",
			actionCircle: "flex items-center justify-center", // Transparent background for overlay style usually
			actionLabel: "text-[11px] font-medium drop-shadow-md",
			navWrapper: "hidden", // Often hidden on mobile overlay, or minimal
			navButton: "hidden",
		},
		sidebar: {
			container:
				"hidden w-16 flex-col items-center gap-6 py-4 text-white/80 lg:flex",
			actionWrapper: "flex flex-col items-center gap-6",
			actionCircle:
				"flex items-center justify-center rounded-full bg-gray-800 p-3.5 shadow hover:bg-gray-700 transition-colors",
			actionLabel: "text-xs font-semibold",
			navWrapper: "flex flex-col items-center gap-4 text-xs font-semibold",
			navButton:
				"rounded-full border border-white/10 bg-gray-800 p-2.5 text-white hover:bg-gray-700 hover:text-white transition-colors",
		},
	} as const;

	const {
		container,
		actionWrapper,
		actionCircle,
		actionLabel,
		navWrapper,
		navButton,
	} = layoutStyles[isOverlay ? "overlay" : "sidebar"];

	const actionItems: ActionConfig[] = [
		{
			key: "like",
			label: isLiked ? (likes + 1).toLocaleString() : likes.toLocaleString(),
			Icon: Heart,
			onClick: onLike,
			getIconClass: (variant) =>
				variant === "overlay"
					? `h-8 w-8 drop-shadow-md transition-transform active:scale-75 ${isLiked ? "fill-rose-500 text-rose-500" : "fill-white text-white"}`
					: `h-6 w-6 transition-colors ${isLiked ? "fill-rose-500 text-rose-500" : "fill-white text-white"}`,
		},
		{
			key: "comments",
			label: comments.toLocaleString(),
			Icon: MessageCircle,
			getIconClass: (variant) =>
				variant === "overlay"
					? "h-8 w-8 text-white fill-white drop-shadow-md"
					: "h-6 w-6 text-white fill-white",
		},
		{
			key: "shares",
			label: shares,
			Icon: Share2,
			getIconClass: (variant) =>
				variant === "overlay"
					? "h-8 w-8 text-white fill-white drop-shadow-md"
					: "h-6 w-6 text-white fill-white",
		},
		// Remake action - only shown when storyboardId is available
		...(storyboardId && onRemake
			? [
					{
						key: "remake",
						label: "Remake",
						Icon: Sparkles,
						onClick: onRemake,
						highlight: true,
						getIconClass: (variant: "overlay" | "sidebar") =>
							variant === "overlay"
								? "h-8 w-8 text-purple-400 drop-shadow-md"
								: "h-6 w-6 text-purple-400",
					},
				]
			: []),
	];

	const Container = isOverlay ? "div" : "aside";

	return (
		<Container className={cn(container, className)}>
			<div className="relative mb-4">
				<Avatar
					className={cn(
						"border border-white/60 shadow-sm",
						isOverlay ? "h-10 w-10" : "h-14 w-14",
					)}
				>
					<AvatarImage src={avatar} alt={username} />
					<AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
				</Avatar>
				<Button
					size="icon"
					className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 border-[2px] border-white"
				>
					<Plus className="h-3 w-3" strokeWidth={3} />
				</Button>
			</div>

			<div className={actionWrapper}>
				{actionItems.map(
					({ key, label, Icon, onClick, getIconClass, highlight }) => {
						const Wrapper = onClick ? "button" : "div";
						return (
							<Wrapper
								key={key}
								type={onClick ? "button" : undefined}
								onClick={onClick}
								className="flex flex-col items-center gap-1 cursor-pointer group"
							>
								<div
									className={cn(
										actionCircle,
										highlight &&
											layout === "sidebar" &&
											"bg-purple-500/20 hover:bg-purple-500/30 ring-1 ring-purple-500/50",
										highlight &&
											layout === "overlay" &&
											"bg-purple-500/30 rounded-full p-2",
									)}
								>
									<Icon className={getIconClass(layout)} />
								</div>
								<span
									className={cn(
										actionLabel,
										highlight && "text-purple-400",
									)}
								>
									{label}
								</span>
							</Wrapper>
						);
					},
				)}
			</div>

			<div className={navWrapper}>
				<button
					type="button"
					onClick={onPrev}
					className={navButton}
					aria-label="Previous video"
				>
					<ChevronUp className="h-5 w-5" />
				</button>
				<button
					type="button"
					onClick={onNext}
					className={navButton}
					aria-label="Next video"
				>
					<ChevronDown className="h-5 w-5" />
				</button>
			</div>
		</Container>
	);
}

function Plus({
	className,
	strokeWidth = 2,
}: {
	className?: string;
	strokeWidth?: number;
}) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			role="img"
			aria-label="Add user"
		>
			<title>Add user</title>
			<path d="M12 5v14M5 12h14" />
		</svg>
	);
}
