import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Home, LayoutGrid, Upload } from "lucide-react";
import type { ElementType } from "react";

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
import { Route as CreateRoute } from "@/routes/create";
import { Route as IndexRoute } from "@/routes/index";
import { Route as MyVideosRoute } from "@/routes/my-videos";
import { Route as TemplatesRoute } from "@/routes/templates";

type NavItem = {
	label: string;
	icon: ElementType;
	to:
		| (typeof IndexRoute)["to"]
		| (typeof MyVideosRoute)["to"]
		| (typeof CreateRoute)["to"]
		| (typeof TemplatesRoute)["to"];
};

const primaryNav: NavItem[] = [
	{ label: "Home", icon: Home, to: IndexRoute.to },
];

const personalNav: NavItem[] = [
	{ label: "My Videos", icon: Bookmark, to: MyVideosRoute.to },
	{ label: "Create", icon: Upload, to: CreateRoute.to },
	{ label: "Templates", icon: LayoutGrid, to: TemplatesRoute.to },
];

type AppSidebarProps = {
	activeItem?: string;
};

export function AppSidebar({ activeItem = "Shorts" }: AppSidebarProps) {
	const { location } = useRouterState();
	const pathMap: Record<string, string> = {
		"/": "Shorts",
		"/create": "Create",
	};
	const resolvedActive = pathMap[location.pathname] ?? activeItem;

	return (
		<Sidebar collapsible="icon" className="border-r border-gray-200">
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
										<Link to={item.to}>
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
			<SidebarFooter className="py-4 text-xs text-muted-foreground">
				Made for quick story-sized content.
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
