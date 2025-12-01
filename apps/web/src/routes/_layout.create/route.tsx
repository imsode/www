import { createFileRoute, redirect } from "@tanstack/react-router";

// DEPRECATED: The create flow is now dialog-based.
// All /create/* routes redirect to home.
// The CreateVideoDialog can be opened from the sidebar or mobile nav.
export const Route = createFileRoute("/_layout/create")({
	beforeLoad: () => {
		throw redirect({
			to: "/",
		});
	},
});
