import { ChevronLeft, Loader2, Play, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Character, Template } from "../-types";

interface CastingStepProps {
	template: Template;
	characters: Character[];
	selectedCharacterIds: string[];
	assignments: Record<string, string>;
	onAssign: (role: string, charId: string) => void;
	onGenerate: () => void;
	onBack?: () => void;
	onCancel?: () => void;
	isGenerating: boolean;
}

export function CastingStep({
	template,
	characters,
	selectedCharacterIds,
	assignments,
	onAssign,
	onGenerate,
	onBack,
	onCancel,
	isGenerating,
}: CastingStepProps) {
	const selectedChars = characters.filter((c) =>
		selectedCharacterIds.includes(c.id),
	);
	const isComplete = template.roles.every((role) => assignments[role]);

	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Desktop View: Sora-style Absolute Layout */}
			<div className="hidden lg:flex w-full h-full relative bg-black">
				{/* 1. The Stage (Left) - Flex-1 but padded to respect absolute sidebar */}
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

				{/* 2. The Inspector (Right) - Absolute Positioned */}
				<div className="absolute right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-20">
					<div className="flex-1 overflow-y-auto">
						<div className="p-6 space-y-6 w-full">
							<div className="pb-4 border-b border-white/10">
								<h2 className="text-xl font-bold text-white">
									Cast Your Roles
								</h2>
								<p className="text-zinc-400 text-sm mt-1">
									Assign characters to roles in "{template.name}"
								</p>
							</div>

							<div className="space-y-6">
								{template.roles.map((role) => (
									<div key={role} className="space-y-3">
										<span className="text-sm font-semibold text-zinc-300 block uppercase tracking-wide">
											{role}
										</span>
										<div className="grid grid-cols-3 gap-3">
											{selectedChars.map((char) => (
												<button
													key={char.id}
													type="button"
													onClick={() => onAssign(role, char.id)}
													className={cn(
														"flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group bg-zinc-950",
														assignments[role] === char.id
															? "border-white ring-1 ring-white/20 shadow-lg"
															: "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900",
													)}
												>
													<Avatar className="w-12 h-12 mb-2 shadow-sm group-hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-white/10">
														<AvatarImage src={char.imageUrl} />
														<AvatarFallback>{char.name[0]}</AvatarFallback>
													</Avatar>
													<span
														className={cn(
															"text-xs font-medium truncate w-full text-center",
															assignments[role] === char.id
																? "text-white"
																: "text-zinc-400",
														)}
													>
														{char.name}
													</span>
													{assignments[role] === char.id && (
														<div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
													)}
												</button>
											))}
										</div>
									</div>
								))}
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

			{/* Mobile View (Left Panel) */}
			<div className="lg:hidden flex-1 flex flex-col w-full bg-white h-full">
				<div className="flex-1 overflow-y-auto">
					<div className="flex flex-col min-h-full">
						{/* Mobile: Top Preview */}
						<div className="relative aspect-[9/16] overflow-hidden shadow-xl shrink-0 w-full bg-black">
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
							<video
								src={template.videoUrl}
								poster={template.image}
								autoPlay
								muted
								loop
								playsInline
								className="w-full h-full object-cover opacity-80"
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center">
									<h2 className="text-white text-2xl font-bold drop-shadow-md">
										{template.name}
									</h2>
								</div>
							</div>
						</div>

						{/* Content Area */}
						<div className="p-4 space-y-6 max-w-lg mx-auto w-full">
							<div className="pb-2 border-b border-gray-100">
								<h2 className="text-2xl font-bold">Cast Your Roles</h2>
								<p className="text-gray-500">
									Assign characters to roles in "{template.name}"
								</p>
							</div>

							<div className="space-y-6">
								{template.roles.map((role) => (
									<div key={role} className="space-y-3">
										<span className="text-sm font-semibold text-gray-900 block uppercase tracking-wide">
											{role}
										</span>
										<div className="grid grid-cols-3 gap-3">
											{selectedChars.map((char) => (
												<button
													key={char.id}
													type="button"
													onClick={() => onAssign(role, char.id)}
													className={cn(
														"flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group",
														assignments[role] === char.id
															? "border-black bg-gray-50 ring-1 ring-black/5 shadow-md"
															: "border-gray-100 hover:border-gray-300 hover:bg-gray-50",
													)}
												>
													<Avatar className="w-12 h-12 mb-2 shadow-sm group-hover:scale-105 transition-transform">
														<AvatarImage src={char.imageUrl} />
														<AvatarFallback>{char.name[0]}</AvatarFallback>
													</Avatar>
													<span className="text-xs font-medium truncate w-full text-center text-gray-700">
														{char.name}
													</span>
													{assignments[role] === char.id && (
														<div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
													)}
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 border-t bg-white z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
					<div className="flex items-center gap-4 max-w-lg mx-auto w-full">
						{onBack && (
							<Button
								type="button"
								variant="ghost"
								onClick={onBack}
								className="hidden sm:flex text-gray-500 hover:text-black rounded-full px-6"
							>
								Back
							</Button>
						)}
						<Button
							type="button"
							onClick={onGenerate}
							disabled={!isComplete || isGenerating}
							className="w-full rounded-full shadow-lg h-12 text-base"
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
	);
}
