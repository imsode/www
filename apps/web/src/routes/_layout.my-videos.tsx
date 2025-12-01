import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { assets, generations, storyboards } from "@repo/db/schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, inArray } from "drizzle-orm";
import {
	AlertCircle,
	Clock,
	Download,
	Loader2,
	Play,
	RefreshCw,
	Share2,
	Sparkles,
	Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getSessionFn } from "@/lib/auth/session";
import { presignRead } from "@/lib/presign";
import { cn } from "@/lib/utils";

// Types
type GenerationItem = {
	id: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	storyboardName: string;
	createdAt: string;
	videoUrl?: string;
	posterUrl?: string;
	errorMessage?: string;
};

// Server function to fetch user generations
const fetchUserGenerations = createServerFn().handler(
	async (): Promise<GenerationItem[]> => {
		const session = await getSessionFn();
		const userId = session?.user?.id;
		if (!userId) {
			return [];
		}

		const db = createDb(env.HYPERDRIVE.connectionString);

		const results = await db
			.select({
				id: generations.id,
				status: generations.status,
				storyboardId: generations.generationRequest,
				createdAt: generations.createdAt,
				errorMessage: generations.errorMessage,
				generatedAssetId: generations.generatedAssetId,
				assetKey: assets.assetKey,
				posterKey: assets.posterKey,
			})
			.from(generations)
			.leftJoin(assets, eq(generations.generatedAssetId, assets.id))
			.where(eq(generations.userId, userId))
			.orderBy(desc(generations.createdAt));

		// Fetch storyboard names for display
		const storyboardIds = [
			...new Set(results.map((r) => r.storyboardId?.storyboardId)),
		].filter(Boolean) as string[];

		const storyboardResults =
			storyboardIds.length > 0
				? await db
						.select({ id: storyboards.id, data: storyboards.data })
						.from(storyboards)
						.where(inArray(storyboards.id, storyboardIds))
				: [];

		const storyboardMap = new Map(
			storyboardResults.map((s) => [s.id, s.data.title]),
		);

		return await Promise.all(
			results.map(async (gen) => {
				const item: GenerationItem = {
					id: gen.id,
					status: gen.status,
					storyboardName:
						storyboardMap.get(gen.storyboardId?.storyboardId ?? "") ??
						"Unknown Template",
					createdAt: gen.createdAt.toISOString(),
					errorMessage: gen.errorMessage ?? undefined,
				};

				// If completed, get presigned URLs
				if (gen.status === "COMPLETED" && gen.assetKey) {
					const [video, poster] = await Promise.all([
						presignRead({ data: { key: gen.assetKey } }),
						gen.posterKey
							? presignRead({ data: { key: gen.posterKey } })
							: Promise.resolve({ url: "" }),
					]);
					item.videoUrl = video.url;
					item.posterUrl = poster.url || undefined;
				}

				return item;
			}),
		);
	},
);

export const Route = createFileRoute("/_layout/my-videos")({
	component: MyVideosPage,
});

// Status badge component
function StatusBadge({
	status,
}: {
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}) {
	const config = {
		PENDING: {
			label: "Queued",
			icon: Clock,
			className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		},
		PROCESSING: {
			label: "Generating",
			icon: Sparkles,
			className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
		},
		COMPLETED: {
			label: "Ready",
			icon: Play,
			className: "bg-green-500/20 text-green-400 border-green-500/30",
		},
		FAILED: {
			label: "Failed",
			icon: AlertCircle,
			className: "bg-red-500/20 text-red-400 border-red-500/30",
		},
	};

	const { label, icon: Icon, className } = config[status];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
				className,
			)}
		>
			{status === "PROCESSING" ? (
				<Icon className="w-3 h-3 animate-pulse" />
			) : (
				<Icon className="w-3 h-3" />
			)}
			{label}
		</span>
	);
}

// Video card component
function VideoCard({
	generation,
	onPlay,
}: {
	generation: GenerationItem;
	onPlay: () => void;
}) {
	const isReady = generation.status === "COMPLETED";
	const isFailed = generation.status === "FAILED";
	const isProcessing =
		generation.status === "PROCESSING" || generation.status === "PENDING";

	return (
		<div className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
			{/* Thumbnail / Placeholder */}
			<div className="relative aspect-[9/16]">
				{isReady && generation.posterUrl ? (
					<img
						src={generation.posterUrl}
						alt={generation.storyboardName}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
						{isProcessing && (
							<div className="text-center">
								<div className="relative mb-3">
									<div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
										<Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
									</div>
									<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
								</div>
								<p className="text-xs text-zinc-400">Creating magic...</p>
							</div>
						)}
						{isFailed && (
							<div className="text-center px-4">
								<AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
								<p className="text-xs text-red-400 line-clamp-2">
									{generation.errorMessage || "Generation failed"}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Hover overlay for ready videos */}
				{isReady && (
					<button
						type="button"
						onClick={onPlay}
						className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
					>
						<div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
							<Play className="w-6 h-6 text-white fill-white ml-1" />
						</div>
					</button>
				)}

				{/* Status badge */}
				<div className="absolute top-3 left-3">
					<StatusBadge status={generation.status} />
				</div>
			</div>

			{/* Info */}
			<div className="p-3">
				<h3 className="text-sm font-medium text-white truncate">
					{generation.storyboardName}
				</h3>
				<p className="text-xs text-zinc-500 mt-1">
					{new Date(generation.createdAt).toLocaleDateString()}
				</p>

				{/* Actions for ready videos */}
				{isReady && (
					<div className="flex gap-2 mt-3">
						<Button
							size="sm"
							variant="ghost"
							className="flex-1 h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
							onClick={() => toast.info("Share coming soon!")}
						>
							<Share2 className="w-3 h-3 mr-1" />
							Share
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="flex-1 h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
							onClick={() => {
								if (generation.videoUrl) {
									window.open(generation.videoUrl, "_blank");
								}
							}}
						>
							<Download className="w-3 h-3 mr-1" />
							Download
						</Button>
					</div>
				)}

				{/* Retry for failed */}
				{isFailed && (
					<Button
						size="sm"
						variant="ghost"
						className="w-full mt-3 h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
						onClick={() => toast.info("Retry coming soon!")}
					>
						<RefreshCw className="w-3 h-3 mr-1" />
						Retry
					</Button>
				)}
			</div>
		</div>
	);
}

// Video preview dialog
function VideoPreviewDialog({
	generation,
	open,
	onOpenChange,
}: {
	generation: GenerationItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!generation?.videoUrl) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-black border-zinc-800 p-0 sm:max-w-2xl overflow-hidden">
				<DialogHeader className="p-4 border-b border-zinc-800">
					<DialogTitle className="text-white">
						{generation.storyboardName}
					</DialogTitle>
				</DialogHeader>
				<div className="relative aspect-[9/16] max-h-[70vh] bg-black">
					<video
						src={generation.videoUrl}
						poster={generation.posterUrl}
						controls
						autoPlay
						className="w-full h-full object-contain"
					>
						<track kind="captions" />
					</video>
				</div>
				<div className="p-4 border-t border-zinc-800 flex gap-2">
					<Button
						className="flex-1"
						variant="outline"
						onClick={() => toast.info("Share coming soon!")}
					>
						<Share2 className="w-4 h-4 mr-2" />
						Share
					</Button>
					<Button
						className="flex-1"
						onClick={() => {
							if (generation.videoUrl) {
								window.open(generation.videoUrl, "_blank");
							}
						}}
					>
						<Download className="w-4 h-4 mr-2" />
						Download
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function MyVideosPage() {
	const [previewGeneration, setPreviewGeneration] =
		useState<GenerationItem | null>(null);

	const {
		data: generationsData = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["userGenerations"],
		queryFn: () => fetchUserGenerations(),
		refetchInterval: (query) => {
			// Poll if there are any pending/processing generations
			const data = query.state.data;
			if (
				data?.some((g) => g.status === "PENDING" || g.status === "PROCESSING")
			) {
				return 5000; // Poll every 5 seconds
			}
			return false;
		},
	});

	const inProgress = generationsData.filter(
		(g) => g.status === "PENDING" || g.status === "PROCESSING",
	);
	const completed = generationsData.filter((g) => g.status === "COMPLETED");
	const failed = generationsData.filter((g) => g.status === "FAILED");

	return (
		<div className="min-h-full bg-zinc-950 pb-[4.5rem] sm:pb-0">
			<div className="max-w-6xl mx-auto p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold text-white">My Videos</h1>
						<p className="text-zinc-400 text-sm mt-1">
							{generationsData.length} video
							{generationsData.length !== 1 ? "s" : ""} total
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => refetch()}
						className="text-zinc-400 hover:text-white"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						Refresh
					</Button>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
					</div>
				)}

				{/* Empty state */}
				{!isLoading && generationsData.length === 0 && (
					<div className="text-center py-20">
						<Video className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-white mb-2">
							No videos yet
						</h2>
						<p className="text-zinc-400 max-w-md mx-auto">
							Create your first video by clicking the Create button in the
							sidebar. Your generated videos will appear here.
						</p>
					</div>
				)}

				{/* In Progress Section */}
				{inProgress.length > 0 && (
					<div className="mb-10">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-purple-400" />
							In Progress ({inProgress.length})
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{inProgress.map((generation) => (
								<VideoCard
									key={generation.id}
									generation={generation}
									onPlay={() => {}}
								/>
							))}
						</div>
					</div>
				)}

				{/* Completed Section */}
				{completed.length > 0 && (
					<div className="mb-10">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Play className="w-5 h-5 text-green-400" />
							Completed ({completed.length})
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{completed.map((generation) => (
								<VideoCard
									key={generation.id}
									generation={generation}
									onPlay={() => setPreviewGeneration(generation)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Failed Section */}
				{failed.length > 0 && (
					<div>
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-red-400" />
							Failed ({failed.length})
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{failed.map((generation) => (
								<VideoCard
									key={generation.id}
									generation={generation}
									onPlay={() => {}}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Video Preview Dialog */}
			<VideoPreviewDialog
				generation={previewGeneration}
				open={!!previewGeneration}
				onOpenChange={(open) => !open && setPreviewGeneration(null)}
			/>
		</div>
	);
}
