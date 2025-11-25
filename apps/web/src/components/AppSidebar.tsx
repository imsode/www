import { Link, useRouterState } from "@tanstack/react-router";
import {
	Bell,
	Bookmark,
	ChevronsUpDown,
	Home,
	LayoutGrid,
	LogOut,
	Search,
	Upload,
} from "lucide-react";
import type { ElementType } from "react";
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
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { Route as CreateRoute } from "@/routes/_layout.create/route";
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
		: user.email?.[0]?.toUpperCase() ?? "U";

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
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
	const { location } = useRouterState();
	const pathMap: Record<string, string> = {
		"/": "Shorts",
		"/create": "Create",
	};
	const resolvedActive = pathMap[location.pathname] ?? activeItem;

	const primaryNav: NavItem[] = [
		{ label: "Home", icon: Home, to: IndexRoute.to },
		{ label: "Search", icon: Search, onClick: onSearchClick },
		{ label: "Notifications", icon: Bell, onClick: () => {} },
	];

	const personalNav: NavItem[] = [
		{ label: "My Videos", icon: Bookmark, to: MyVideosRoute.to },
		{ label: "Create", icon: Upload, to: CreateRoute.to },
		{ label: "Templates", icon: LayoutGrid, to: TemplatesRoute.to },
	];

	return (
		<Sidebar collapsible="icon" className="border-r border-gray-200" {...props}>
			<SidebarHeader className="flex items-center gap-3 px-4 py-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="/">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<img
										src="/logo192.png"
										alt="Your Story logo"
										className="size-4 rounded-sm object-cover"
									/>
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">Your Story</span>
									<span className="">Stories for you</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{primaryNav.map((item) => (
								<SidebarMenuItem key={item.label}>
									{item.to ? (
										<SidebarMenuButton
											isActive={item.label === resolvedActive}
											tooltip={item.label}
											asChild
										>
											<Link to={item.to}>
												<item.icon className="h-4 w-4" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									) : (
										<SidebarMenuButton
											isActive={item.label === resolvedActive}
											tooltip={item.label}
											onClick={item.onClick}
										>
											<item.icon className="h-4 w-4" />
											<span>{item.label}</span>
										</SidebarMenuButton>
									)}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className="mx-0" />

				<SidebarGroup>
					<SidebarGroupLabel>You</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{personalNav.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										tooltip={item.label}
										isActive={item.label === resolvedActive}
										asChild
									>
										<Link
											to={item.to ?? ""}
											className="flex items-center gap-2 w-full"
										>
											<item.icon className="h-4 w-4" />
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
	);
}
