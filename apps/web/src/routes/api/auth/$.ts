import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import auth from "@/lib/auth/auth";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => {
				return auth(env).handler(request);
			},
			POST: ({ request }) => {
				return auth(env).handler(request);
			},
		},
	},
});
