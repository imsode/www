import { ArrowRight, CheckCircle2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Character } from "../-types";
import { StepContainer, StepFooter, StepHeader } from "./ui/StepLayout";

interface CharacterSelectionStepProps {
	characters: Character[];
	selectedIds: string[];
	onSelect: (ids: string[]) => void;
	onNext: () => void;
	onBack?: () => void;
}

export function CharacterSelectionStep({
	characters,
	selectedIds,
	onSelect,
	onNext,
	onBack,
}: CharacterSelectionStepProps) {
	const toggleSelection = (id: string) => {
		if (selectedIds.includes(id)) {
			onSelect(selectedIds.filter((i) => i !== id));
		} else {
			if (selectedIds.length >= 3) {
				toast.error("Select up to 3 characters");
				return;
			}
			onSelect([...selectedIds, id]);
		}
	};

	return (
		<StepContainer className="p-4 relative">
			{onBack && (
				<button
					type="button"
					onClick={onBack}
					className="absolute top-0 right-4 p-2 text-gray-400 hover:text-black sm:hidden"
					aria-label="Cancel"
				>
					<X className="w-6 h-6" />
				</button>
			)}

			<StepHeader
				title="Select Characters"
				description="Pick up to 3 stars for your video"
			/>

			<div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
				{characters.map((char) => {
					const isSelected = selectedIds.includes(char.id);
					return (
						<button
							key={char.id}
							type="button"
							onClick={() => toggleSelection(char.id)}
							className="flex flex-col items-center gap-2 group relative"
						>
							<div
								className={cn(
									"relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300 border-2",
									isSelected
										? "border-black scale-110 shadow-lg ring-2 ring-black ring-offset-2"
										: "border-transparent group-hover:scale-105",
								)}
							>
								<Avatar className="w-full h-full">
									<AvatarImage src={char.imageUrl} className="object-cover" />
									<AvatarFallback>{char.name[0]}</AvatarFallback>
								</Avatar>
								{isSelected && (
									<div className="absolute inset-0 bg-black/20 flex items-center justify-center">
										<CheckCircle2 className="text-white w-8 h-8 drop-shadow-md" />
									</div>
								)}
							</div>
							<span
								className={cn(
									"text-sm font-medium transition-colors",
									isSelected ? "text-black" : "text-gray-500",
								)}
							>
								{char.name}
							</span>
						</button>
					);
				})}
				{/* Mock Upload Button */}
				<button
					type="button"
					onClick={() => toast.info("Upload coming soon!")}
					className="flex flex-col items-center gap-2 group"
				>
					<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
						<Plus className="w-8 h-8 text-gray-400" />
					</div>
					<span className="text-sm text-gray-500">Upload +</span>
				</button>
			</div>

			<StepFooter>
				<div className="flex items-center gap-4 w-full justify-between sm:justify-center">
					<div className="flex items-center gap-2 sm:hidden">
						<div className="flex -space-x-2">
							{selectedIds.map((id) => {
								const char = characters.find((c) => c.id === id);
								return (
									<Avatar
										key={id}
										className="w-8 h-8 border-2 border-white ring-1 ring-gray-100"
									>
										<AvatarImage src={char?.imageUrl} />
										<AvatarFallback>{char?.name[0]}</AvatarFallback>
									</Avatar>
								);
							})}
						</div>
					</div>
					{onBack && (
						<Button
							type="button"
							variant="ghost"
							onClick={onBack}
							className="hidden sm:flex text-gray-500 hover:text-black"
						>
							Cancel
						</Button>
					)}
					<Button
						type="button"
						onClick={onNext}
						disabled={selectedIds.length === 0}
						className="rounded-full px-8 flex-1 sm:flex-none"
					>
						Continue <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</StepFooter>
		</StepContainer>
	);
}
