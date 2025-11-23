import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/templates")({
	component: TemplatesPage,
});

function TemplatesPage() {
	return (
		<div className="min-h-screen bg-slate-900 pb-[3.5rem] sm:pb-0">
			<div className="max-w-7xl mx-auto p-6">
				<h1 className="text-white text-2xl mb-6">Select Template</h1>
				{/* Template grid */}
			</div>
		</div>
	);
}
