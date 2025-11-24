import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
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
	const location = useLocation();
	const isCreateFlow = location.pathname.startsWith("/create");

	return (
		<>
			{/* Desktop layout */}
			<div className="hidden relative sm:block max-h-screen min-h-screen">
				<SidebarProvider
					style={
						{
							"--sidebar-width": "20rem",
							"--sidebar-width-mobile": "0",
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
			<div className="relative sm:hidden max-h-screen min-h-screen">
				<Outlet />
				{!isCreateFlow && <MobileBottomNav />}
			</div>
		</>
	);
}
