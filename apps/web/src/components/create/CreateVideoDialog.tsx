import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import { actors, assets, storyboards } from "@repo/db/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import {
	Check,
	ChevronRight,
	Loader2,
	Play,
	Plus,
	Sparkles,
	Video,
} from "lucide-react";
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
import { getSessionFn } from "@/lib/auth/session";
import { presignReadHelper } from "@/lib/presign";
import { cn } from "@/lib/utils";
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

// Server functions for data fetching
const fetchStoryboards = createServerFn().handler(
	async (): Promise<Storyboard[]> => {
		const db = createDb(env.HYPERDRIVE.connectionString);

		const storyboardResults = await db
			.select({
				id: storyboards.id,
				data: storyboards.data,
				previewVideoAssetKey: assets.assetKey,
				previewVideoAssetPosterKey: assets.posterKey,
			})
			.from(storyboards)
			.innerJoin(assets, eq(storyboards.previewVideoAssetId, assets.id));

		if (storyboardResults.length === 0) {
			return [];
		}

		return await Promise.all(
			storyboardResults.map(async (storyboard) => {
				const [image, video] = await Promise.all([
					presignReadHelper({
						key: storyboard.previewVideoAssetPosterKey as string,
					}),
					presignReadHelper({ key: storyboard.previewVideoAssetKey }),
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
			}),
		);
	},
);

const fetchActors = createServerFn().handler(async (): Promise<Actor[]> => {
	const session = await getSessionFn();
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
			const imageUrl = await presignReadHelper({ key: actor.assetKey });
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

// Compact Template Card
function TemplateCard({
	storyboard,
	isSelected,
	onSelect,
}: {
	storyboard: Storyboard;
	isSelected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={isSelected}
			aria-label={`Select ${storyboard.name}`}
			className={cn(
				"group relative w-full aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all",
				isSelected
					? "border-white ring-2 ring-white/30 scale-[1.02]"
					: "border-transparent hover:border-white/40 opacity-70 hover:opacity-100",
			)}
		>
			<img
				src={storyboard.previewImageUrl}
				alt={storyboard.name}
				className="absolute inset-0 w-full h-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

			{isSelected && (
				<div className="absolute top-2 right-2 bg-white text-black rounded-full p-1">
					<Check className="w-3 h-3" />
				</div>
			)}

			<div className="absolute bottom-0 left-0 right-0 p-2">
				<span className="text-white text-xs font-semibold truncate">
					{storyboard.name}
				</span>
				<span className="text-white/60 text-[10px] truncate">
					{storyboard.roles.length} roles
				</span>
			</div>
		</button>
	);
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
			className="w-full flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
		>
			{isAuto ? (
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center shrink-0">
					<Sparkles className="w-4 h-4 text-purple-300" />
				</div>
			) : (
				<Avatar className="w-8 h-8 border border-white/20 shrink-0">
					<AvatarImage src={assignedActor?.imageUrl} />
					<AvatarFallback className="text-xs">
						{assignedActor?.name[0]}
					</AvatarFallback>
				</Avatar>
			)}
			<div className="flex-1 text-left min-w-0">
				<div className="text-xs text-zinc-400 truncate">{role.name}</div>
				<div className="text-sm text-white truncate">
					{isAuto ? (
						<span className="flex items-center gap-1">
							Auto{" "}
							<span className="text-[9px] text-purple-300 bg-purple-500/20 px-1 rounded">
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

// Actor Selection Grid (for role assignment)
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
			<div className="grid grid-cols-4 gap-3">
				{/* Auto option */}
				<button
					type="button"
					onClick={() => {
						onSelect(AUTO_ACTOR_ID);
						onClose();
					}}
					className="flex flex-col items-center gap-1 group"
				>
					<div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-all">
						<Sparkles className="w-6 h-6 text-purple-300" />
					</div>
					<span className="text-xs text-zinc-300">Auto</span>
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
						className="flex flex-col items-center gap-1 group"
					>
						<Avatar className="w-14 h-14 border border-transparent group-hover:border-white/50 transition-all">
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
					className="flex flex-col items-center gap-1 group"
				>
					<div className="w-14 h-14 rounded-full border border-dashed border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
						<Plus className="w-6 h-6 text-zinc-600" />
					</div>
					<span className="text-xs text-zinc-500">Add</span>
				</button>
			</div>
		</div>
	);
}

// Main Dialog Content
function CreateVideoContent({ onClose }: { onClose: () => void }) {
	const [selectedStoryboardId, setSelectedStoryboardId] = useState<
		string | null
	>(null);
	const [assignments, setAssignments] = useState<Record<string, string>>({});
	const [selectingRoleId, setSelectingRoleId] = useState<string | null>(null);

	// Fetch data
	const { data: storyboardsData = [], isLoading: loadingStoryboards } =
		useQuery({
			queryKey: ["storyboards"],
			queryFn: () => fetchStoryboards(),
		});

	const { data: actorsData = [] } = useQuery({
		queryKey: ["actors"],
		queryFn: () => fetchActors(),
	});

	// Selected storyboard
	const selectedStoryboard = storyboardsData.find(
		(s) => s.id === selectedStoryboardId,
	);

	// Initialize assignments when storyboard is selected
	const currentAssignments = useMemo(() => {
		if (!selectedStoryboard) return {};
		const defaults: Record<string, string> = {};
		for (const role of selectedStoryboard.roles) {
			defaults[role.id] = assignments[role.id] ?? AUTO_ACTOR_ID;
		}
		return defaults;
	}, [selectedStoryboard, assignments]);

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
		if (!selectedStoryboardId) return;
		generateMutation.mutate({
			storyboardId: selectedStoryboardId,
			assignments: currentAssignments,
		});
	};

	const handleAssign = (roleId: string, actorId: string) => {
		setAssignments((prev) => ({ ...prev, [roleId]: actorId }));
	};

	// Actor selection sub-view
	if (selectingRoleId) {
		const role = selectedStoryboard?.roles.find(
			(r) => r.id === selectingRoleId,
		);
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
	if (loadingStoryboards) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
			</div>
		);
	}

	// Auto count for selected storyboard
	const autoCount = selectedStoryboard
		? selectedStoryboard.roles.filter(
				(r) =>
					!currentAssignments[r.id] ||
					currentAssignments[r.id] === AUTO_ACTOR_ID,
			).length
		: 0;

	return (
		<div className="flex flex-col h-full max-h-[80vh]">
			{/* Template Selection */}
			<div className="p-4 border-b border-zinc-800">
				<h3 className="text-white font-semibold mb-3 flex items-center gap-2">
					<Video className="w-4 h-4" />
					Choose Template
				</h3>
				<div className="flex gap-3 overflow-x-auto pb-2">
					{storyboardsData.map((storyboard) => (
						<div key={storyboard.id} className="w-28 shrink-0">
							<TemplateCard
								storyboard={storyboard}
								isSelected={selectedStoryboardId === storyboard.id}
								onSelect={() => setSelectedStoryboardId(storyboard.id)}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Role Casting */}
			{selectedStoryboard && (
				<div className="flex-1 overflow-auto p-4">
					<h3 className="text-white font-semibold mb-3 flex items-center gap-2">
						<Sparkles className="w-4 h-4" />
						Cast Roles
					</h3>
					<div className="space-y-2">
						{selectedStoryboard.roles.map((role) => {
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
			)}

			{/* Empty state when no template selected */}
			{!selectedStoryboard && (
				<div className="flex-1 flex items-center justify-center p-8">
					<div className="text-center text-zinc-500">
						<Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p className="text-sm">Select a template to get started</p>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
				{autoCount > 0 && selectedStoryboard && (
					<div className="text-center text-xs text-zinc-400 mb-3 flex items-center justify-center gap-1">
						<Sparkles className="w-3 h-3 text-purple-400" />
						AI will cast {autoCount} role{autoCount > 1 ? "s" : ""}
					</div>
				)}
				<Button
					onClick={handleGenerate}
					disabled={!selectedStoryboardId || generateMutation.isPending}
					className="w-full rounded-full bg-white text-black hover:bg-white/90 font-semibold h-11"
				>
					{generateMutation.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Play className="mr-2 h-4 w-4 fill-current" />
					)}
					Generate Video
				</Button>
			</div>
		</div>
	);
}

// Main Export Component
interface CreateVideoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateVideoDialog({
	open,
	onOpenChange,
}: CreateVideoDialogProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="bg-zinc-950 border-zinc-800 max-h-[90vh]">
					<DrawerHeader className="border-b border-zinc-800">
						<DrawerTitle className="text-white text-center">
							Create Video
						</DrawerTitle>
					</DrawerHeader>
					<CreateVideoContent onClose={() => onOpenChange(false)} />
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg p-0 overflow-hidden">
				<DialogHeader className="p-4 border-b border-zinc-800">
					<DialogTitle className="text-white">Create Video</DialogTitle>
				</DialogHeader>
				<CreateVideoContent onClose={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
