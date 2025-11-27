import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import auth from "./auth";

/**
 * Server function to get the current user session.
 *
 * This function accesses request headers to retrieve the session cookie
 * and validate the user's authentication status.
 *
 * @returns Session object with user data if authenticated, null otherwise
 *
 * @example
 * ```tsx
 * const session = await getSessionFn();
 * if (session?.user) {
 *   console.log("Authenticated as:", session.user.email);
 * }
 * ```
 */
export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const session = await auth(env).api.getSession({
			headers,
		});

		return session;
	},
);
