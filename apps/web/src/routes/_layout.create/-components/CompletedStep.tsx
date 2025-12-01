import { Check, Download, Home, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface CompletedStepProps {
	videoUrl: string;
	onRestart: () => void;
}

export function CompletedStep({ videoUrl, onRestart }: CompletedStepProps) {
	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Check out my video!",
					url: videoUrl,
				});
			} catch {
				// User cancelled or error
			}
		} else {
			await navigator.clipboard.writeText(videoUrl);
			toast.success("Link copied to clipboard!");
		}
	};

	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = videoUrl;
		link.download = "my-video.mp4";
		link.click();
	};

	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Subtle gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-black to-cyan-900/10" />

			{/* Desktop Layout */}
			<div className="hidden lg:flex w-full h-full relative">
				{/* Stage (Left) - Video Player */}
				<div className="flex-1 h-full flex items-center justify-center pr-[420px] relative">
					<div className="relative h-full p-4 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950">
						<video
							src={videoUrl}
							controls
							autoPlay
							loop
							playsInline
							className="w-full h-full object-cover rounded-lg"
						>
							<track kind="captions" />
						</video>
					</div>
				</div>

				{/* Inspector (Right) - Actions Panel */}
				<div className="absolute right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-white/10 flex flex-col shadow-2xl z-20">
					<div className="flex-1 flex flex-col items-center justify-center p-8">
						{/* Success indicator */}
						<div className="relative mb-8">
							<div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
							<div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
								<Check className="w-10 h-10 text-white" strokeWidth={3} />
							</div>
						</div>

						<h2 className="text-2xl font-bold text-white mb-2 text-center">
							Your Video is Ready!
						</h2>
						<p className="text-zinc-400 text-center mb-8">
							Watch, download, or share your creation.
						</p>

						{/* Action buttons */}
						<div className="w-full space-y-3">
							<Button
								type="button"
								onClick={handleShare}
								className="w-full rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12"
								size="lg"
							>
								<Share2 className="mr-2 h-5 w-5" />
								Share
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={handleDownload}
								className="w-full rounded-full border-white/20 text-white hover:bg-white/10 h-12"
								size="lg"
							>
								<Download className="mr-2 h-5 w-5" />
								Download
							</Button>
						</div>
					</div>

					{/* Footer Actions */}
					<div className="p-6 border-t border-white/10 bg-zinc-900">
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="ghost"
								onClick={onRestart}
								className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full px-6"
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Create Another
							</Button>
							<Button
								asChild
								variant="ghost"
								className="flex-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
							>
								<Link to="/">
									<Home className="mr-2 h-4 w-4" />
									Go to Feed
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Layout */}
			<div className="lg:hidden flex flex-col w-full h-[100dvh] relative">
				{/* Video fills most of the screen */}
				<div className="flex-1 relative">
					<video
						src={videoUrl}
						controls
						autoPlay
						loop
						playsInline
						className="absolute inset-0 w-full h-full object-contain bg-black"
					>
						<track kind="captions" />
					</video>
				</div>

				{/* Bottom Sheet */}
				<div className="bg-zinc-950/95 backdrop-blur-xl rounded-t-[2rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
					{/* Success indicator */}
					<div className="flex items-center justify-center gap-3 mb-4">
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
							<Check className="w-4 h-4 text-white" strokeWidth={3} />
						</div>
						<h2 className="text-lg font-bold text-white">Video Ready!</h2>
					</div>

					{/* Action buttons */}
					<div className="flex gap-3 mb-4">
						<Button
							type="button"
							onClick={handleShare}
							className="flex-1 rounded-full bg-white text-black hover:bg-white/90 font-semibold h-12"
							size="lg"
						>
							<Share2 className="mr-2 h-5 w-5" />
							Share
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleDownload}
							className="flex-1 rounded-full border-white/20 text-white hover:bg-white/10 h-12"
							size="lg"
						>
							<Download className="mr-2 h-5 w-5" />
							Download
						</Button>
					</div>

					{/* Secondary actions */}
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={onRestart}
							className="flex-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-10 text-sm"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Create Another
						</Button>
						<Button
							asChild
							variant="ghost"
							className="flex-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-10 text-sm"
						>
							<Link to="/">
								<Home className="mr-2 h-4 w-4" />
								Feed
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
