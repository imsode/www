import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/create")({
	component: CreateLayout,
	beforeLoad: ({ location }) => {
		if (location.pathname === "/create" || location.pathname === "/create/") {
			throw redirect({
				to: "/create/template",
			});
		}
	},
});

function CreateLayout() {
	return (
		<div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-50">
			<div className="flex-1 flex flex-col">
				<Outlet />
			</div>
		</div>
	);
}
