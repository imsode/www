import { Link, useRouterState } from "@tanstack/react-router";
import {
	Bell,
	Bookmark,
	ChevronsUpDown,
	Command,
	Home,
	LayoutGrid,
	LogOut,
	Plus,
	Search,
} from "lucide-react";
import { type ElementType, useState } from "react";
import { CreateVideoDialog } from "@/components/create/CreateVideoDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { Route as IndexRoute } from "@/routes/_layout.index";
import { Route as MyVideosRoute } from "@/routes/_layout.my-videos";
import { Route as TemplatesRoute } from "@/routes/_layout.templates";

function UserMenu() {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<SidebarMenuButton size="lg" className="cursor-default">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-lg bg-sidebar-accent animate-pulse" />
					<div className="flex-1 space-y-1">
						<div className="h-4 w-20 bg-sidebar-accent animate-pulse rounded" />
						<div className="h-3 w-28 bg-sidebar-accent animate-pulse rounded" />
					</div>
				</div>
			</SidebarMenuButton>
		);
	}

	if (!session?.user) {
		return null;
	}

	const user = session.user;
	const initials = user.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: (user.email?.[0]?.toUpperCase() ?? "U");

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/login";
				},
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-0"
				>
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
						<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">
							{user.name || "User"}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							{user.email}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto size-4" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side="top"
				align="start"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage
								src={user.image ?? undefined}
								alt={user.name ?? ""}
							/>
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">
								{user.name || "User"}
							</span>
							<span className="truncate text-xs text-muted-foreground">
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type NavItem = {
	label: string;
	icon: ElementType;
	to?: string;
	onClick?: () => void;
};

export function AppSidebar({
	activeItem = "Shorts",
	onSearchClick,
	...props
}: { activeItem?: string; onSearchClick?: () => void } & React.ComponentProps<
	typeof Sidebar
>) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const { location } = useRouterState();
	const pathMap: Record<string, string> = {
		"/": "Shorts",
	};
	const resolvedActive = pathMap[location.pathname] ?? activeItem;

	const primaryNav: NavItem[] = [
		{ label: "Home", icon: Home, to: IndexRoute.to },
		{ label: "Search", icon: Search, onClick: onSearchClick },
		{ label: "Notifications", icon: Bell, onClick: () => {} },
	];

	const personalNav: NavItem[] = [
		{ label: "My Videos", icon: Bookmark, to: MyVideosRoute.to },
		{ label: "Templates", icon: LayoutGrid, to: TemplatesRoute.to },
	];

	return (
		<>
		<Sidebar
			collapsible="none"
			className="w-[calc(var(--sidebar-width-icon)+10px)]! h-screen border-r border-sidebar-border"
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
							className="md:h-8 md:p-0 justify-center"
						>
							<a href="/">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Command className="size-4" />
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="justify-center">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{primaryNav.map((item) => (
								<SidebarMenuItem key={item.label}>
									{item.to ? (
										<SidebarMenuButton
											isActive={item.label === resolvedActive}
											tooltip={item.label}
											className="[&>svg]:size-6"
											size="lg"
											asChild
										>
											<Link to={item.to}>
												<item.icon />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									) : (
										<SidebarMenuButton
											isActive={item.label === resolvedActive}
											tooltip={item.label}
											onClick={item.onClick}
											className="[&>svg]:size-6"
											size="lg"
										>
											<item.icon />
											<span>{item.label}</span>
										</SidebarMenuButton>
									)}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className="mx-0" />

				{/* Prominent Create Button */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Create"
									onClick={() => setIsCreateDialogOpen(true)}
									className="[&>svg]:size-5 bg-white text-black hover:bg-white/90 rounded-full"
									size="lg"
								>
									<Plus className="stroke-[2.5]" />
									<span className="font-semibold">Create</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className="mx-0" />

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{personalNav.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										tooltip={item.label}
										isActive={item.label === resolvedActive}
										className="[&>svg]:size-6"
										size="lg"
										asChild
									>
										<Link
											to={item.to ?? ""}
											className="flex items-center gap-2 w-full"
										>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<UserMenu />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
		<CreateVideoDialog
			open={isCreateDialogOpen}
			onOpenChange={setIsCreateDialogOpen}
		/>
		</>
	);
}
