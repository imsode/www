import { Loader2, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Character, Template } from "../-types";
import { StepContainer, StepFooter } from "./ui/StepLayout";

interface CastingStepProps {
	template: Template;
	characters: Character[];
	selectedCharacterIds: string[];
	assignments: Record<string, string>;
	onAssign: (role: string, charId: string) => void;
	onGenerate: () => void;
	isGenerating: boolean;
}

export function CastingStep({
	template,
	characters,
	selectedCharacterIds,
	assignments,
	onAssign,
	onGenerate,
	isGenerating,
}: CastingStepProps) {
	const selectedChars = characters.filter((c) =>
		selectedCharacterIds.includes(c.id),
	);
	const isComplete = template.roles.every((role) => assignments[role]);

	return (
		<StepContainer className="flex flex-col h-full">
			{/* Top: Preview */}
			<div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-xl mb-6 shrink-0 max-h-[40vh] w-full sm:w-auto sm:mx-auto">
				<video
					src={template.videoUrl}
					poster={template.image}
					autoPlay
					muted
					loop
					playsInline
					className="w-full h-full object-cover opacity-60"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center">
						<h2 className="text-white text-2xl font-bold drop-shadow-md">
							{template.name}
						</h2>
						<p className="text-white/80 text-sm">Cast your stars</p>
					</div>
				</div>
			</div>

			{/* Bottom: Roles */}
			<div className="space-y-4 flex-1 overflow-y-auto sm:max-w-lg sm:mx-auto w-full">
				{template.roles.map((role) => (
					<div key={role} className="space-y-2">
						<span className="text-sm font-medium text-gray-700 block">
							{role}
						</span>
						<div className="grid grid-cols-3 gap-2">
							{selectedChars.map((char) => (
								<button
									key={char.id}
									type="button"
									onClick={() => onAssign(role, char.id)}
									className={cn(
										"flex flex-col items-center p-2 rounded-lg border-2 transition-all",
										assignments[role] === char.id
											? "border-black bg-gray-50"
											: "border-transparent hover:bg-gray-50",
									)}
								>
									<Avatar className="w-10 h-10 mb-1">
										<AvatarImage src={char.imageUrl} />
										<AvatarFallback>{char.name[0]}</AvatarFallback>
									</Avatar>
									<span className="text-xs font-medium truncate w-full text-center">
										{char.name}
									</span>
								</button>
							))}
						</div>
					</div>
				))}
			</div>

			<StepFooter>
				<Button
					type="button"
					onClick={onGenerate}
					disabled={!isComplete || isGenerating}
					className="w-full max-w-md rounded-full shadow-lg"
					size="lg"
				>
					{isGenerating ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Play className="mr-2 h-4 w-4 fill-current" />
					)}
					Generate Video
				</Button>
			</StepFooter>
		</StepContainer>
	);
}
