import { cn } from "@/lib/utils";

export function StepHeader({
	title,
	description,
	className,
}: {
	title: string;
	description: string;
	className?: string;
}) {
	return (
		<div className={cn("text-center space-y-2 mb-8", className)}>
			<h2 className="text-2xl font-bold">{title}</h2>
			<p className="text-gray-500">{description}</p>
		</div>
	);
}

export function StepContainer({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"container max-w-4xl mx-auto p-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function StepFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="fixed bottom-0 sm:left-[var(--sidebar-width)] right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-md border-t border-gray-100 z-[60] flex justify-center items-center w-full sm:w-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
			<div className="max-w-4xl w-full flex justify-center sm:justify-end">
				{children}
			</div>
		</div>
	);
}
