import { ArrowRight, Check, ChevronLeft, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Template } from "../-types";

interface TemplateSelectionStepProps {
	templates: Template[];
	selectedTemplateId: string | null;
	onSelect: (id: string) => void;
	onNext: (templateId?: string) => void;
	onBack?: () => void;
	onCancel?: () => void;
}

interface MobileTemplateCarouselProps {
	templates: Template[];
	onSelect: (id: string) => void;
	onNext: (templateId?: string) => void;
	onBack?: () => void;
	onCancel?: () => void;
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
	onCancel,
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

interface TemplateCardProps {
	template: Template;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onHover?: (id: string | null) => void;
}

const TemplateCard = ({
	template,
	isSelected,
	onSelect,
	onHover,
}: TemplateCardProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		if (isHovered) {
			videoRef.current?.play().catch(() => {
				// Ignore autoplay errors
			});
			onHover?.(template.id);
		} else {
			videoRef.current?.pause();
			if (videoRef.current) {
				videoRef.current.currentTime = 0;
			}
		}
	}, [isHovered, template.id, onHover]);

	return (
		<button
			type="button"
			onClick={() => onSelect(template.id)}
			onMouseEnter={() => {
				setIsHovered(true);
				onHover?.(template.id);
			}}
			onMouseLeave={() => {
				setIsHovered(false);
				onHover?.(null);
			}}
			className={cn(
				"group relative w-full aspect-[9/16] rounded-xl overflow-hidden border-2 text-left transition-all",
				isSelected
					? "border-white ring-2 ring-white/20 shadow-xl scale-[1.02]"
					: "border-transparent hover:border-white/30 hover:shadow-lg opacity-80 hover:opacity-100",
				"bg-zinc-900", // Dark card background
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

export function TemplateSelectionStep({
	templates,
	selectedTemplateId,
	onSelect,
	onNext,
	onBack,
	onCancel,
}: TemplateSelectionStepProps) {
	// State for the active preview (hovered or selected)
	const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(
		null,
	);

	// Determine which template to show in the large preview
	const activeTemplateId =
		hoveredTemplateId || selectedTemplateId || templates[0]?.id;
	const activeTemplate = templates.find((t) => t.id === activeTemplateId);

	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Mobile View: Full Screen Vertical Carousel */}
			<div className="lg:hidden w-full h-full">
				<MobileTemplateCarousel
					templates={templates}
					onSelect={onSelect}
					onNext={onNext}
					onBack={onBack}
					onCancel={onCancel}
				/>
			</div>

			{/* Desktop View: Sora-style Absolute Layout */}
			<div className="hidden lg:flex w-full h-full relative bg-black">
				{/* 1. The Stage (Left) - Flex-1 but padded to respect absolute sidebar */}
				<div className="flex-1 h-full flex items-center justify-center pr-[420px] relative">
					{activeTemplate && (
						<div className="relative h-full p-4 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950">
							<video
								key={activeTemplate.id}
								src={activeTemplate.videoUrl}
								poster={activeTemplate.image}
								autoPlay
								muted
								loop
								playsInline
								className="w-full h-full object-cover"
							/>
							{/* Cinematic Info Overlay */}
							<div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500">
								<h2 className="text-white text-3xl font-bold drop-shadow-md">
									{activeTemplate.name}
								</h2>
								<p className="text-white/80 mt-2 line-clamp-2 text-lg">
									{activeTemplate.description}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* 2. The Inspector (Right) - Absolute Positioned */}
				<div className="absolute right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-20">
					{/* Header */}
					<div className="p-6 border-b border-white/10 bg-zinc-900 z-10">
						<h2 className="text-xl font-bold text-white mb-1">Choose Style</h2>
						<p className="text-zinc-400 text-sm">Select a template to start</p>
					</div>

					{/* Scrollable Grid */}
					<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
						<div className="grid grid-cols-2 gap-3">
							{templates.map((template) => (
								<div key={template.id}>
									<TemplateCard
										template={template}
										onSelect={onSelect}
										isSelected={selectedTemplateId === template.id}
										onHover={setHoveredTemplateId}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Footer Actions */}
					<div className="p-6 border-t border-white/10 bg-zinc-900 z-10">
						<div className="flex items-center gap-3">
							{onBack && (
								<Button
									type="button"
									variant="ghost"
									onClick={onBack}
									className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full px-6"
								>
									Back
								</Button>
							)}
							<Button
								type="button"
								onClick={() => onNext()}
								disabled={!selectedTemplateId}
								className="flex-1 rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12"
							>
								Continue <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
