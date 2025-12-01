import { Link } from "@tanstack/react-router";
import { Home, Plus } from "lucide-react";
import { useState } from "react";
import { CreateVideoDialog } from "@/components/create/CreateVideoDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileBottomNav() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	return (
		<>
			<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black px-5 pt-2 text-white pb-safe">
				<div className="mx-auto grid w-full max-w-md grid-cols-3 gap-4 text-center">
					<Link
						to="/"
						activeOptions={{ exact: true }}
						className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-white/60 transition hover:text-white [&.active]:text-white"
						activeProps={{ className: "text-white" }}
					>
						<Home className="h-6 w-6" />
						<span className="text-[10px]">Home</span>
					</Link>

					<button
						type="button"
						onClick={() => setIsCreateDialogOpen(true)}
						className="flex flex-col items-center justify-center gap-1 text-xs font-semibold transition"
					>
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
							<Plus className="h-6 w-6 stroke-[2.5]" />
						</div>
					</button>

					<Link
						to="/my-videos"
						className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-white/60 transition hover:text-white [&.active]:text-white"
						activeProps={{ className: "text-white" }}
						aria-label="You"
					>
						<Avatar className="h-6 w-6 border border-white/20 shadow-sm">
							<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<span className="text-[10px]">You</span>
					</Link>
				</div>
			</nav>
			<CreateVideoDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			/>
		</>
	);
}
