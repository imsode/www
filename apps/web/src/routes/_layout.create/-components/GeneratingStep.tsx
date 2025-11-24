import { Loader2 } from "lucide-react";

export function GeneratingStep() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
			<div className="relative">
				<div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
				<div className="relative bg-white p-4 rounded-full shadow-xl">
					<Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
				</div>
			</div>
			<div className="text-center space-y-2">
				<h2 className="text-2xl font-bold">Creating Magic...</h2>
				<p className="text-gray-500 max-w-xs mx-auto">
					We are weaving your story. This might take a moment.
				</p>
			</div>
		</div>
	);
}
