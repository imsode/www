import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/my-videos")({
	component: MyVideosPage,
});

function MyVideosPage() {
	return (
		<div className="min-h-full bg-slate-900 pb-[3.5rem] sm:pb-0">
			<div className="max-w-7xl mx-auto p-6">
				<h1 className="text-white text-2xl mb-6">My Videos</h1>
				{/* Video management grid */}
			</div>
		</div>
	);
}
