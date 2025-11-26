import { ChevronLeft, Loader2, Play, Plus, User, X } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import type { Character, Template } from "../-types";

interface CastingStepProps {
	template: Template;
	characters: Character[];
	assignments: Record<string, string>; // roleId -> characterId
	onAssign: (roleId: string, charId: string) => void;
	onGenerate: () => void;
	onBack?: () => void;
	onCancel?: () => void;
	isGenerating: boolean;
}

function CharacterGrid({
	characters,
	onSelect,
}: {
	characters: Character[];
	onSelect: (charId: string) => void;
}) {
	return (
		<div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
			{characters.map((char) => (
				<button
					key={char.id}
					type="button"
					onClick={() => onSelect(char.id)}
					className="flex flex-col items-center gap-2 group"
				>
					<Avatar className="w-20 h-20 border-2 border-transparent group-hover:border-white/50 transition-all">
						<AvatarImage src={char.imageUrl} />
						<AvatarFallback>{char.name[0]}</AvatarFallback>
					</Avatar>
					<span className="text-sm text-zinc-400 group-hover:text-white">
						{char.name}
					</span>
				</button>
			))}
			<button
				type="button"
				onClick={() => toast.info("Upload coming soon!")}
				className="flex flex-col items-center gap-2 group"
			>
				<div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
					<Plus className="w-8 h-8 text-zinc-500" />
				</div>
				<span className="text-sm text-zinc-500">Upload</span>
			</button>
		</div>
	);
}

export function CastingStep({
	template,
	characters,
	assignments,
	onAssign,
	onGenerate,
	onBack,
	onCancel,
	isGenerating,
}: CastingStepProps) {
	const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
	const activeRole = template.roles.find((r) => r.id === activeRoleId);
	const isComplete = template.roles.every((role) => assignments[role.id]);
	const isMobile = useIsMobile();

	const handleCharacterSelect = (charId: string) => {
		if (activeRoleId) {
			onAssign(activeRoleId, charId);
			setActiveRoleId(null);
		}
	};

	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Character Picker */}
			{isMobile ? (
				<Drawer
					open={!!activeRoleId}
					onOpenChange={(open) => !open && setActiveRoleId(null)}
				>
					<DrawerContent className="bg-zinc-950 border-zinc-800">
						<DrawerHeader>
							<DrawerTitle className="text-white text-center">
								Select {activeRole?.name}
							</DrawerTitle>
						</DrawerHeader>
						<div className="p-4 max-h-[70vh] overflow-y-auto">
							<CharacterGrid
								characters={characters}
								onSelect={handleCharacterSelect}
							/>
						</div>
					</DrawerContent>
				</Drawer>
			) : (
				<Dialog
					open={!!activeRoleId}
					onOpenChange={(open) => !open && setActiveRoleId(null)}
				>
					<DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-3xl">
						<DialogHeader>
							<DialogTitle className="text-white text-center">
								Select {activeRole?.name}
							</DialogTitle>
						</DialogHeader>
						<div className="p-4 max-h-[70vh] overflow-y-auto">
							<CharacterGrid
								characters={characters}
								onSelect={handleCharacterSelect}
							/>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Desktop View: Sora-style Absolute Layout */}
			<div className="hidden lg:flex w-full h-full relative bg-black">
				{/* 1. The Stage (Left) */}
				<div className="flex-1 h-full flex items-center justify-center pr-[420px] relative">
					<div className="relative h-full p-4 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950">
						<video
							src={template.videoUrl}
							poster={template.image}
							autoPlay
							muted
							loop
							playsInline
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center">
								<h2 className="text-white text-2xl font-bold drop-shadow-md">
									{template.name}
								</h2>
								<p className="text-white/80 text-sm">Cast your stars</p>
							</div>
						</div>
					</div>
				</div>

				{/* 2. The Inspector (Right) */}
				<div className="absolute right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-20">
					<div className="flex-1 overflow-y-auto">
						<div className="p-6 space-y-6 w-full">
							<div className="pb-4 border-b border-white/10">
								<h2 className="text-xl font-bold text-white">
									Cast Your Roles
								</h2>
								<p className="text-zinc-400 text-sm mt-1">
									Tap a role to assign a character
								</p>
							</div>

							<div className="space-y-4">
								{template.roles.map((role) => {
									const assignedId = assignments[role.id];
									const assignedChar = characters.find(
										(c) => c.id === assignedId,
									);

									return (
										<div key={role.id} className="space-y-2">
											<span className="text-sm font-semibold text-zinc-300 block uppercase tracking-wide">
												{role.name}
											</span>
											<button
												type="button"
												onClick={() => setActiveRoleId(role.id)}
												className={cn(
													"w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-200 bg-zinc-950 group hover:bg-zinc-900",
													assignedChar
														? "border-white/20 hover:border-white/40"
														: "border-zinc-800 hover:border-zinc-700 border-dashed",
												)}
											>
												{assignedChar ? (
													<>
														<Avatar className="w-12 h-12 border border-white/10">
															<AvatarImage src={assignedChar.imageUrl} />
															<AvatarFallback>
																{assignedChar.name[0]}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1 text-left">
															<div className="font-medium text-white">
																{assignedChar.name}
															</div>
															<div className="text-xs text-zinc-400">
																Tap to change
															</div>
														</div>
													</>
												) : (
													<>
														<div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600">
															<User className="w-5 h-5 text-zinc-500" />
														</div>
														<div className="flex-1 text-left">
															<div className="font-medium text-zinc-400">
																Select Actor
															</div>
															<div className="text-xs text-zinc-500">
																Tap to assign
															</div>
														</div>
													</>
												)}
											</button>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="p-6 border-t border-white/10 bg-zinc-900 z-10">
						<div className="flex items-center gap-3 w-full">
							{onBack && (
								<Button
									type="button"
									variant="ghost"
									onClick={onBack}
									className="hidden sm:flex text-zinc-400 hover:text-white hover:bg-white/10 rounded-full px-6"
								>
									Back
								</Button>
							)}
							<Button
								type="button"
								onClick={onGenerate}
								disabled={!isComplete || isGenerating}
								className="flex-1 rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12 shadow-lg"
								size="lg"
							>
								{isGenerating ? (
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								) : (
									<Play className="mr-2 h-5 w-5 fill-current" />
								)}
								Generate Video
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile View: Immersive Bottom Sheet Layout */}
			<div className="lg:hidden flex flex-col w-full h-full relative">
				{/* 1. Background Video */}
				<div className="absolute inset-0 z-0 bg-black">
					<video
						src={template.videoUrl}
						poster={template.image}
						autoPlay
						muted
						loop
						playsInline
						className="w-full h-full object-cover opacity-60"
					/>
					{/* Gradient overlays for readability */}
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
				</div>

				{/* 2. Top Navigation Controls */}
				<div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start">
					{onBack && (
						<button
							type="button"
							onClick={onBack}
							className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 shadow-lg active:scale-95 transition-all"
							aria-label="Go back"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
					)}
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 shadow-lg active:scale-95 transition-all"
							aria-label="Cancel"
						>
							<X className="w-6 h-6" />
						</button>
					)}
				</div>

				{/* 3. Bottom Sheet Content */}
				<div className="absolute inset-x-0 bottom-0 z-20 flex flex-col max-h-[75vh]">
					{/* Header Info Overlay */}
					<div className="px-6 pb-4 text-center">
						<h2 className="text-white text-2xl font-bold drop-shadow-lg">
							{template.name}
						</h2>
					</div>

					{/* Glassmorphism Sheet */}
					<div className="bg-zinc-950/80 backdrop-blur-xl rounded-t-[2rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
						{/* Scrollable Roles List */}
						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-bold text-white">Cast Roles</h3>
								<span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
									{template.roles.filter((r) => assignments[r.id]).length} /{" "}
									{template.roles.length} Ready
								</span>
							</div>

							<div className="space-y-3">
								{template.roles.map((role) => {
									const assignedId = assignments[role.id];
									const assignedChar = characters.find(
										(c) => c.id === assignedId,
									);

									return (
										<div key={role.id} className="space-y-1.5">
											<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide ml-1">
												{role.name}
											</span>
											<button
												type="button"
												onClick={() => setActiveRoleId(role.id)}
												className={cn(
													"w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 relative overflow-hidden",
													assignedChar
														? "bg-white/10 border-white/20"
														: "bg-white/5 border-white/5 border-dashed hover:bg-white/10",
												)}
											>
												{assignedChar ? (
													<>
														<Avatar className="w-10 h-10 border border-white/20">
															<AvatarImage src={assignedChar.imageUrl} />
															<AvatarFallback>
																{assignedChar.name[0]}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1 text-left">
															<div className="font-medium text-white text-sm">
																{assignedChar.name}
															</div>
														</div>
														<div className="text-xs text-white/50 px-2">
															Change
														</div>
													</>
												) : (
													<>
														<div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
															<User className="w-4 h-4 text-zinc-500" />
														</div>
														<div className="flex-1 text-left">
															<div className="font-medium text-zinc-400 text-sm">
																Tap to cast
															</div>
														</div>
													</>
												)}
											</button>
										</div>
									);
								})}
							</div>
						</div>

						{/* Footer Action */}
						<div className="p-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
							<Button
								type="button"
								onClick={onGenerate}
								disabled={!isComplete || isGenerating}
								className="w-full rounded-full shadow-lg h-12 text-base bg-white text-black hover:bg-white/90 font-bold"
								size="lg"
							>
								{isGenerating ? (
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								) : (
									<Play className="mr-2 h-5 w-5 fill-current" />
								)}
								Generate Video
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
