import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { StepContainer, StepFooter, StepHeader } from "./ui/StepLayout";

interface CompletedStepProps {
	videoUrl: string;
	onRestart: () => void;
}

export function CompletedStep({ videoUrl, onRestart }: CompletedStepProps) {
	return (
		<StepContainer>
			<StepHeader
				title="Your Video is Ready!"
				description="Watch, download, or share your creation."
			/>

			<Card className="overflow-hidden bg-black shadow-2xl rounded-2xl max-w-sm mx-auto">
				<div className="aspect-[9/16] relative">
					<video
						src={videoUrl}
						controls
						autoPlay
						loop
						className="w-full h-full object-contain"
					>
						<track kind="captions" />
					</video>
				</div>
			</Card>

			<StepFooter>
				<div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
					<Button asChild size="lg" className="rounded-full w-full">
						<Link to="/">Go to Feed</Link>
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={onRestart}
						className="rounded-full w-full"
						size="lg"
					>
						Create Another
					</Button>
				</div>
			</StepFooter>
		</StepContainer>
	);
}
