import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchSidebar } from "@/components/SearchSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_layout")({
	component: Layout,
});

function Layout() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	return (
		<>
			{/* Desktop layout */}
			<div className="hidden sm:block">
				<SidebarProvider
					style={
						{
							"--sidebar-width": "20rem",
							"--sidebar-width-mobile": "20rem",
						} as React.CSSProperties
					}
				>
					<AppSidebar onSearchClick={() => setIsSearchOpen((prev) => !prev)} />
					{isSearchOpen && (
						<div className="fixed left-[var(--sidebar-width-icon)] z-10 h-full w-80 border-r border-gray-200 transition-[left] duration-200 ease-linear peer-data-[state=expanded]:left-[var(--sidebar-width)]">
							<SearchSidebar />
						</div>
					)}
					<SidebarInset>
						<Outlet />
					</SidebarInset>
				</SidebarProvider>
			</div>

			{/* Mobile layout */}
			<div className="sm:hidden h-full">
				<Outlet />
				<MobileBottomNav />
			</div>
		</>
	);
}
