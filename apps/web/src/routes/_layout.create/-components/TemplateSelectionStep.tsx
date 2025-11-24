import { ArrowRight, Check, ChevronLeft, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
	onNext: (templateId?: string) => void;
	onBack?: () => void;
}

interface MobileTemplateCarouselProps {
	templates: Template[];
	onSelect: (id: string) => void;
	onNext: (templateId?: string) => void;
	onBack?: () => void;
}

interface TemplateGridProps {
	templates: Template[];
	selectedTemplateId: string | null;
	onSelect: (id: string) => void;
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

const MobileTemplateCarousel = ({
	templates,
	onSelect,
	onNext,
	onBack,
}: MobileTemplateCarouselProps) => (
	<div className="block sm:hidden flex-1 relative">
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
		<Carousel
			orientation="vertical"
			className="w-full h-full"
			opts={{ align: "start", loop: true }}
		>
			<CarouselContent className="h-[100vh] mt-0">
				{templates.map((template) => (
					<CarouselItem key={template.id} className="h-full pt-0">
						<div className="relative w-full h-full bg-black">
							<video
								src={template.videoUrl}
								poster={template.image}
								autoPlay
								muted
								loop
								playsInline
								className="absolute inset-0 w-full h-full object-cover opacity-80"
							/>
							<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 flex flex-col justify-end p-6 pb-24">
								<h3 className="text-3xl font-bold text-white mb-2">
									{template.name}
								</h3>
								<TemplateTags tags={template.tags} />
								<p className="text-white/80 mb-4">{template.description}</p>
								<div className="text-white/60 text-sm">
									Requires: {template.roles.join(", ")}
								</div>
							</div>
							<div className="absolute bottom-6 left-6 right-6">
								<Button
									type="button"
									onClick={() => {
										onSelect(template.id);
										onNext(template.id);
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
);

const TemplateCard = ({
	template,
	isSelected,
	onSelect,
}: {
	template: Template;
	isSelected: boolean;
	onSelect: (id: string) => void;
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		if (isHovered) {
			videoRef.current?.play().catch(() => {
				// Ignore autoplay errors
			});
		} else {
			videoRef.current?.pause();
			if (videoRef.current) {
				videoRef.current.currentTime = 0;
			}
		}
	}, [isHovered]);

	return (
		<button
			type="button"
			onClick={() => onSelect(template.id)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"group relative aspect-[9/16] rounded-xl overflow-hidden border-2 text-left transition-all bg-gray-900",
				isSelected
					? "border-primary ring-2 ring-primary ring-offset-2"
					: "border-transparent hover:border-primary/50",
			)}
		>
			<img
				src={template.image}
				alt={template.name}
				className={cn(
					"absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
					isHovered ? "opacity-0" : "opacity-100",
				)}
			/>
			<video
				ref={videoRef}
				src={template.videoUrl}
				muted
				loop
				playsInline
				className={cn(
					"absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
					isHovered ? "opacity-100" : "opacity-0",
				)}
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
					{template.name}
				</h4>
				<div className="flex flex-wrap gap-2">
					<span className="text-white/90 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
						{template.roles.length} Roles
					</span>
					{template.tags.slice(0, 2).map((tag) => (
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

const TemplateGrid = ({
	templates,
	selectedTemplateId,
	onSelect,
}: TemplateGridProps) => (
	<div className="w-full pb-32">
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
			{templates.map((template) => (
				<TemplateCard
					key={template.id}
					template={template}
					onSelect={onSelect}
					isSelected={selectedTemplateId === template.id}
				/>
			))}
		</div>
	</div>
);

export function TemplateSelectionStep({
	templates,
	selectedTemplateId,
	onSelect,
	onNext,
	onBack,
}: TemplateSelectionStepProps) {
	return (
		<div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white">
			<MobileTemplateCarousel
				templates={templates}
				onSelect={onSelect}
				onNext={onNext}
				onBack={onBack}
			/>

			<div className="hidden sm:block container mx-auto p-4">
				<TemplateGrid
					templates={templates}
					selectedTemplateId={selectedTemplateId}
					onSelect={onSelect}
				/>

				<StepFooter>
					<Button
						type="button"
						onClick={() => onNext()}
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
