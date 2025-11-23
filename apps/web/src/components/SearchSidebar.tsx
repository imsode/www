import { SearchBar } from "./SearchBar";
import { SidebarContent, SidebarHeader } from "./ui/sidebar";

export function SearchSidebar() {
	return (
		<div className="flex h-full w-full flex-col bg-white">
			<SidebarHeader className="px-4 py-6">
				<h2 className="text-xl font-semibold px-2 mb-2">Search</h2>
				<SearchBar />
			</SidebarHeader>
			<SidebarContent className="px-4 pb-4">
				<div className="px-2 mb-2 text-sm font-medium text-muted-foreground">
					Recent
				</div>
				<div className="space-y-1">
					{["#nature", "#travel", "#adventure", "mountains"].map((term) => (
						<button
							key={term}
							type="button"
							className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
						>
							{term}
						</button>
					))}
				</div>
			</SidebarContent>
		</div>
	);
}
