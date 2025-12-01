import { Sparkles } from "lucide-react";

export function GeneratingStep() {
	return (
		<div className="h-screen flex flex-col bg-black overflow-hidden relative">
			{/* Animated background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-pulse" />

			{/* Content */}
			<div className="relative flex-1 flex flex-col items-center justify-center px-6">
				{/* Animated loader */}
				<div className="relative mb-8">
					{/* Outer glow ring */}
					<div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />

					{/* Spinning ring */}
					<div className="relative w-24 h-24">
						<div className="absolute inset-0 rounded-full border-2 border-white/10" />
						<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-cyan-500 animate-spin" />

						{/* Center icon */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center backdrop-blur-sm">
								<Sparkles className="w-6 h-6 text-white animate-pulse" />
							</div>
						</div>
					</div>
				</div>

				{/* Text content */}
				<div className="text-center space-y-3 max-w-sm">
					<h2 className="text-2xl font-bold text-white">Creating Magic...</h2>
					<p className="text-zinc-400">
						We're weaving your story. This might take a moment.
					</p>
				</div>

				{/* Progress dots */}
				<div className="flex items-center gap-2 mt-8">
					<div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
					<div className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:-0.15s]" />
					<div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
				</div>
			</div>
		</div>
	);
}
