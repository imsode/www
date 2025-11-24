import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Template } from "../-types";
import { StepFooter } from "./ui/StepLayout";

interface TemplateSelectionStepProps {
	templates: Template[];
	selectedTemplateId: string | null;
	onSelect: (id: string) => void;
	onNext: () => void;
}

export function TemplateSelectionStep({
	templates,
	selectedTemplateId,
	onSelect,
	onNext,
}: TemplateSelectionStepProps) {
	return (
		<div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white">
			{/* Mobile View: Vertical Swipe */}
			<div className="block sm:hidden flex-1 min-h-[28rem]">
				<Carousel
					orientation="vertical"
					className="w-full h-full min-h-[28rem]"
					opts={{ align: "start", loop: true }}
				>
					<CarouselContent className="h-full -mt-0">
						{templates.map((template) => (
							<CarouselItem key={template.id} className="h-full pt-0">
								<div className="relative w-full h-full bg-black">
									<img
										src={template.image}
										alt={template.name}
										className="absolute inset-0 w-full h-full object-cover opacity-80"
									/>
									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 flex flex-col justify-end p-6 pb-24">
										<h3 className="text-3xl font-bold text-white mb-2">
											{template.name}
										</h3>
										<div className="flex gap-2 mb-4">
											{template.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
												>
													{tag}
												</span>
											))}
										</div>
										<p className="text-white/80 mb-4">{template.description}</p>
										<div className="text-white/60 text-sm">
											Requires: {template.roles.join(", ")}
										</div>
									</div>
									{/* Overlay Action Button */}
									<div className="absolute bottom-6 left-6 right-6">
										<Button
											type="button"
											onClick={() => {
												onSelect(template.id);
												onNext();
											}}
											className="w-full rounded-full bg-white text-black hover:bg-white/90"
											size="lg"
										>
											Use This Template
										</Button>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* Desktop View: Split Screen */}
			<div className="hidden sm:flex flex-1 h-[calc(100vh-6rem)] overflow-hidden container max-w-6xl mx-auto p-4 gap-6">
				{/* Left: Preview */}
				<div className="w-1/3 flex flex-col justify-center">
					<div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative shadow-2xl">
						{selectedTemplateId ? (
							<>
								<img
									src={
										templates.find((t) => t.id === selectedTemplateId)?.image
									}
									alt={templates.find((t) => t.id === selectedTemplateId)?.name}
									className="w-full h-full object-cover opacity-80"
								/>
								<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
									<h3 className="text-2xl font-bold text-white">
										{templates.find((t) => t.id === selectedTemplateId)?.name}
									</h3>
								</div>
							</>
						) : (
							<div className="flex items-center justify-center h-full text-white/50">
								Select a template to preview
							</div>
						)}
					</div>
				</div>

				{/* Right: Grid */}
				<div className="w-2/3 overflow-y-auto pb-24">
					<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
						{templates.map((template) => (
							<button
								key={template.id}
								type="button"
								onClick={() => onSelect(template.id)}
								className={cn(
									"group relative aspect-[9/16] rounded-xl overflow-hidden border-2 text-left transition-all",
									selectedTemplateId === template.id
										? "border-black ring-2 ring-black ring-offset-2"
										: "border-transparent hover:border-gray-200",
								)}
							>
								<img
									src={template.image}
									alt={template.name}
									className="w-full h-full object-cover transition-transform group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
								<div className="absolute bottom-0 left-0 p-3 w-full">
									<h4 className="text-white font-bold truncate">
										{template.name}
									</h4>
									<p className="text-white/70 text-xs truncate">
										{template.roles.length} Roles
									</p>
								</div>
							</button>
						))}
					</div>
				</div>
				<StepFooter>
					<Button
						type="button"
						onClick={onNext}
						disabled={!selectedTemplateId}
						className="rounded-full px-8 w-full sm:w-auto"
					>
						Continue <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</StepFooter>
			</div>
		</div>
	);
}
