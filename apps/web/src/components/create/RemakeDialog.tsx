import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { actors, assets, storyboards } from "@repo/db/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { ChevronRight, Loader2, Play, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSessionHelper } from "@/lib/auth/session";
import { presignRead } from "@/lib/presign";
import type { StartGenerationResponse } from "@/routes/api/generations/route";

// Types
interface Actor {
	id: string;
	name: string;
	imageUrl: string;
	isUser?: boolean;
}

interface StoryboardRole {
	id: string;
	name: string;
}

interface Storyboard {
	id: string;
	name: string;
	description: string;
	previewImageUrl: string;
	previewVideoUrl: string;
	roles: StoryboardRole[];
	tags: string[];
}

const AUTO_ACTOR_ID = "auto";

// Server function to fetch a single storyboard
const fetchStoryboardById = createServerFn()
	.inputValidator((data: { storyboardId: string }) => data)
	.handler(
		async ({
			data,
		}: {
			data: { storyboardId: string };
		}): Promise<Storyboard | null> => {
			const db = createDb(env.HYPERDRIVE.connectionString);

			const result = await db
				.select({
					id: storyboards.id,
					data: storyboards.data,
					previewVideoAssetKey: assets.assetKey,
					previewVideoAssetPosterKey: assets.posterKey,
				})
				.from(storyboards)
				.innerJoin(assets, eq(storyboards.previewVideoAssetId, assets.id))
				.where(eq(storyboards.id, data.storyboardId))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			const storyboard = result[0];
			const [image, video] = await Promise.all([
				presignRead({
					key: storyboard.previewVideoAssetPosterKey as string,
				}),
				presignRead({ key: storyboard.previewVideoAssetKey }),
			]);

			return {
				id: storyboard.id,
				name: storyboard.data.title,
				description: storyboard.data.description,
				previewImageUrl: image.url,
				previewVideoUrl: video.url,
				roles: storyboard.data.roles,
				tags: storyboard.data.tags,
			};
		},
	);

// Server function to fetch user's actors
const fetchActors = createServerFn().handler(async (): Promise<Actor[]> => {
	const headers = getRequestHeaders();
	const session = await getSessionHelper(headers);
	const userId = session?.user?.id;
	if (!userId) {
		return [];
	}

	const db = createDb(env.HYPERDRIVE.connectionString);

	const actorResults = await db
		.select({
			id: actors.id,
			name: actors.name,
			assetKey: assets.assetKey,
			type: actors.type,
		})
		.from(actors)
		.innerJoin(assets, eq(actors.assetId, assets.id))
		.where(eq(actors.userId, userId));

	if (actorResults.length === 0) {
		return [];
	}

	return await Promise.all(
		actorResults.map(async (actor) => {
			const imageUrl = await presignRead({
				key: actor.assetKey as string,
			});
			return {
				id: actor.id,
				name: actor.name,
				imageUrl: imageUrl.url,
				isUser: actor.type === "USER_SELFIE",
			};
		}),
	);
});

type StartGenerationInput = {
	storyboardId: string;
	assignments: Record<string, string>;
};

async function startVideoGeneration(
	input: StartGenerationInput,
): Promise<StartGenerationResponse> {
	const assignments = Object.entries(input.assignments).map(
		([roleId, actorId]) => ({ roleId, actorId }),
	);

	const response = await fetch("/api/generations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			storyboardId: input.storyboardId,
			assignments,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			(error as { error: string }).error || "Failed to start video generation",
		);
	}

	return response.json();
}

// Role Assignment Row
function RoleRow({
	role,
	assignedActor,
	isAuto,
	onClick,
}: {
	role: StoryboardRole;
	assignedActor: Actor | null;
	isAuto: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
		>
			{isAuto ? (
				<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center shrink-0">
					<Sparkles className="w-5 h-5 text-purple-300" />
				</div>
			) : (
				<Avatar className="w-10 h-10 border border-white/20 shrink-0">
					<AvatarImage src={assignedActor?.imageUrl} />
					<AvatarFallback className="text-sm">
						{assignedActor?.name[0]}
					</AvatarFallback>
				</Avatar>
			)}
			<div className="flex-1 text-left min-w-0">
				<div className="text-xs text-zinc-400 uppercase tracking-wide">
					{role.name}
				</div>
				<div className="text-sm text-white font-medium truncate">
					{isAuto ? (
						<span className="flex items-center gap-1.5">
							Auto
							<span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
								AI
							</span>
						</span>
					) : (
						assignedActor?.name
					)}
				</div>
			</div>
			<ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
		</button>
	);
}

// Actor Selection Grid
function ActorSelectionGrid({
	actors,
	onSelect,
	onClose,
}: {
	actors: Actor[];
	onSelect: (actorId: string) => void;
	onClose: () => void;
}) {
	return (
		<div className="p-4 space-y-4">
			<div className="grid grid-cols-4 gap-4">
				{/* Auto option */}
				<button
					type="button"
					onClick={() => {
						onSelect(AUTO_ACTOR_ID);
						onClose();
					}}
					className="flex flex-col items-center gap-2 group"
				>
					<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:scale-105 transition-all">
						<Sparkles className="w-7 h-7 text-purple-300" />
					</div>
					<span className="text-xs text-zinc-300 font-medium">Auto</span>
				</button>

				{/* User actors */}
				{actors.map((actor) => (
					<button
						key={actor.id}
						type="button"
						onClick={() => {
							onSelect(actor.id);
							onClose();
						}}
						className="flex flex-col items-center gap-2 group"
					>
						<Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-white/50 group-hover:scale-105 transition-all">
							<AvatarImage src={actor.imageUrl} />
							<AvatarFallback>{actor.name[0]}</AvatarFallback>
						</Avatar>
						<span className="text-xs text-zinc-400 truncate max-w-full">
							{actor.name}
						</span>
					</button>
				))}

				{/* Upload placeholder */}
				<button
					type="button"
					onClick={() => toast.info("Upload coming soon!")}
					className="flex flex-col items-center gap-2 group"
				>
					<div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 group-hover:scale-105 transition-all">
						<Plus className="w-7 h-7 text-zinc-600" />
					</div>
					<span className="text-xs text-zinc-500">Add New</span>
				</button>
			</div>
		</div>
	);
}

// Main Remake Content
function RemakeContent({
	storyboardId,
	videoThumbnail,
	onClose,
}: {
	storyboardId: string;
	videoThumbnail?: string;
	onClose: () => void;
}) {
	const [assignments, setAssignments] = useState<Record<string, string>>({});
	const [selectingRoleId, setSelectingRoleId] = useState<string | null>(null);

	// Fetch storyboard data
	const { data: storyboard, isLoading: loadingStoryboard } = useQuery({
		queryKey: ["storyboard", storyboardId],
		queryFn: () => fetchStoryboardById({ data: { storyboardId } }),
		enabled: !!storyboardId,
	});

	// Fetch actors
	const { data: actorsData = [] } = useQuery({
		queryKey: ["actors"],
		queryFn: () => fetchActors(),
	});

	// Initialize assignments with Auto for all roles
	const currentAssignments = useMemo(() => {
		if (!storyboard) return {};
		const defaults: Record<string, string> = {};
		for (const role of storyboard.roles) {
			defaults[role.id] = assignments[role.id] ?? AUTO_ACTOR_ID;
		}
		return defaults;
	}, [storyboard, assignments]);

	// Generate mutation
	const generateMutation = useMutation({
		mutationFn: (input: StartGenerationInput) => startVideoGeneration(input),
		onSuccess: () => {
			toast.success("Your video is being created!", {
				description: "We'll notify you when it's ready.",
				action: {
					label: "View Progress",
					onClick: () => {
						window.location.href = "/my-videos";
					},
				},
			});
			onClose();
		},
		onError: (error) => {
			toast.error("Failed to start generation", {
				description: error.message,
			});
		},
	});

	const handleGenerate = () => {
		if (!storyboardId) return;
		generateMutation.mutate({
			storyboardId,
			assignments: currentAssignments,
		});
	};

	const handleAssign = (roleId: string, actorId: string) => {
		setAssignments((prev) => ({ ...prev, [roleId]: actorId }));
	};

	// Actor selection sub-view
	if (selectingRoleId && storyboard) {
		const role = storyboard.roles.find((r) => r.id === selectingRoleId);
		return (
			<div className="flex flex-col h-full">
				<div className="p-4 border-b border-zinc-800">
					<button
						type="button"
						onClick={() => setSelectingRoleId(null)}
						className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
					>
						<ChevronRight className="w-4 h-4 rotate-180" />
						Back
					</button>
					<h3 className="text-white font-semibold mt-2">Select {role?.name}</h3>
				</div>
				<ActorSelectionGrid
					actors={actorsData}
					onSelect={(actorId) => handleAssign(selectingRoleId, actorId)}
					onClose={() => setSelectingRoleId(null)}
				/>
			</div>
		);
	}

	// Loading state
	if (loadingStoryboard) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
			</div>
		);
	}

	// Error state
	if (!storyboard) {
		return (
			<div className="flex items-center justify-center h-64 p-4">
				<div className="text-center text-zinc-500">
					<p className="text-sm">Template not found</p>
				</div>
			</div>
		);
	}

	// Auto count
	const autoCount = storyboard.roles.filter(
		(r) =>
			!currentAssignments[r.id] || currentAssignments[r.id] === AUTO_ACTOR_ID,
	).length;

	return (
		<div className="flex flex-col h-full max-h-[80vh]">
			{/* Video Preview Header */}
			<div className="p-4 border-b border-zinc-800">
				<div className="flex gap-4 items-start">
					{/* Thumbnail */}
					<div className="w-20 h-28 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
						<img
							src={videoThumbnail || storyboard.previewImageUrl}
							alt={storyboard.name}
							className="w-full h-full object-cover"
						/>
					</div>
					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="text-white font-bold text-lg truncate">
							{storyboard.name}
						</h3>
						<p className="text-zinc-400 text-sm line-clamp-2 mt-1">
							{storyboard.description}
						</p>
						<div className="flex flex-wrap gap-1.5 mt-2">
							{storyboard.tags.slice(0, 3).map((tag) => (
								<span
									key={tag}
									className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Role Casting */}
			<div className="flex-1 overflow-auto p-4">
				<h3 className="text-white font-semibold mb-4 flex items-center gap-2">
					<Sparkles className="w-4 h-4 text-purple-400" />
					Cast Your Roles
				</h3>
				<div className="space-y-2">
					{storyboard.roles.map((role) => {
						const assignedId = currentAssignments[role.id];
						const isAuto = !assignedId || assignedId === AUTO_ACTOR_ID;
						const assignedActor = isAuto
							? null
							: (actorsData.find((a) => a.id === assignedId) ?? null);

						return (
							<RoleRow
								key={role.id}
								role={role}
								assignedActor={assignedActor}
								isAuto={isAuto}
								onClick={() => setSelectingRoleId(role.id)}
							/>
						);
					})}
				</div>
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
				{autoCount > 0 && (
					<div className="text-center text-xs text-zinc-400 mb-3 flex items-center justify-center gap-1.5">
						<Sparkles className="w-3 h-3 text-purple-400" />
						AI will cast {autoCount} role{autoCount > 1 ? "s" : ""}
					</div>
				)}
				<Button
					onClick={handleGenerate}
					disabled={generateMutation.isPending}
					className="w-full rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12 text-base"
				>
					{generateMutation.isPending ? (
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />
					) : (
						<Play className="mr-2 h-5 w-5 fill-current" />
					)}
					Create Your Version
				</Button>
			</div>
		</div>
	);
}

// Main Export Component
export interface RemakeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storyboardId: string;
	videoThumbnail?: string;
}

export function RemakeDialog({
	open,
	onOpenChange,
	storyboardId,
	videoThumbnail,
}: RemakeDialogProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="bg-zinc-950 border-zinc-800 max-h-[90vh]">
					<DrawerHeader className="border-b border-zinc-800">
						<DrawerTitle className="text-white text-center">
							Create Your Version
						</DrawerTitle>
					</DrawerHeader>
					<RemakeContent
						storyboardId={storyboardId}
						videoThumbnail={videoThumbnail}
						onClose={() => onOpenChange(false)}
					/>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md p-0 overflow-hidden">
				<DialogHeader className="p-4 border-b border-zinc-800">
					<DialogTitle className="text-white">Create Your Version</DialogTitle>
				</DialogHeader>
				<RemakeContent
					storyboardId={storyboardId}
					videoThumbnail={videoThumbnail}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
