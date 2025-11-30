import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchSidebar } from "@/components/SearchSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/auth-client";
import { getSessionFn } from "@/lib/auth/session";

export const Route = createFileRoute("/_layout")({
	// beforeLoad: async ({ location }) => {
	// 	const session = await getSessionFn();
	// 	if (!session?.user) {
	// 		throw redirect({ to: "/login", search: { redirect: location.pathname } });
	// 	}
	// },
	component: Layout,
});

function AuthLoadingSkeleton() {
	return (
		<div className="min-h-screen bg-neutral-50">
			{/* Desktop skeleton */}
			<div className="hidden sm:flex">
				{/* Sidebar skeleton */}
				<div className="w-64 border-r border-gray-200 p-4 space-y-4">
					<div className="flex items-center gap-3 mb-8">
						<Skeleton className="w-10 h-10 rounded-lg" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
					<Skeleton className="h-4 w-12" />
					<div className="space-y-2">
						<Skeleton className="h-9 w-full rounded-md" />
						<Skeleton className="h-9 w-full rounded-md" />
						<Skeleton className="h-9 w-full rounded-md" />
					</div>
					<Skeleton className="h-4 w-8 mt-6" />
					<div className="space-y-2">
						<Skeleton className="h-9 w-full rounded-md" />
						<Skeleton className="h-9 w-full rounded-md" />
						<Skeleton className="h-9 w-full rounded-md" />
					</div>
				</div>
				{/* Main content skeleton */}
				<div className="flex-1 p-8">
					<div className="max-w-4xl mx-auto space-y-6">
						<Skeleton className="h-8 w-48" />
						<div className="grid grid-cols-3 gap-4">
							<Skeleton className="aspect-[9/16] rounded-xl" />
							<Skeleton className="aspect-[9/16] rounded-xl" />
							<Skeleton className="aspect-[9/16] rounded-xl" />
						</div>
					</div>
				</div>
			</div>
			{/* Mobile skeleton */}
			<div className="sm:hidden flex flex-col min-h-screen">
				<div className="flex-1 p-4 space-y-4">
					<Skeleton className="h-10 w-full rounded-full" />
					<Skeleton className="aspect-[9/16] w-full rounded-xl" />
				</div>
				<div className="h-16 border-t border-gray-200 flex items-center justify-around px-4">
					<Skeleton className="w-8 h-8 rounded" />
					<Skeleton className="w-8 h-8 rounded" />
					<Skeleton className="w-8 h-8 rounded" />
					<Skeleton className="w-8 h-8 rounded" />
				</div>
			</div>
		</div>
	);
}

function Layout() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const location = useLocation();
	const isCreateFlow = location.pathname.startsWith("/create");

	const { data: session, isPending } = useSession();

	// Show loading skeleton while checking auth
	if (isPending) {
		return <AuthLoadingSkeleton />;
	}

	// Don't render content if not authenticated (will redirect)
	if (!session) {
		return <AuthLoadingSkeleton />;
	}

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
