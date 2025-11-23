import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bookmark, Home, LayoutGrid, Search, Upload } from "lucide-react";
import type { ElementType } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Route as CreateRoute } from "@/routes/_layout.create";
import { Route as IndexRoute } from "@/routes/_layout.index";
import { Route as MyVideosRoute } from "@/routes/_layout.my-videos";
import { Route as TemplatesRoute } from "@/routes/_layout.templates";

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
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer"
									alt="Viewer"
								/>
								<AvatarFallback className="rounded-lg">U</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">Viewer</span>
								<span className="truncate text-xs">viewer@example.com</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
