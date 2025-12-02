import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import auth from "./auth";

/**
 * Pure helper function that retrieves the current user session.
 * Can be called directly from server-side code (API routes, other server functions).
 *
 * @param headers - Request headers containing session cookie
 * @returns Session object with user data if authenticated, null otherwise
 */
export async function getSessionHelper(headers: Headers) {
	const session = await auth(env).api.getSession({
		headers,
	});

	return session;
}

/**
 * Server function wrapper for client-side use via RPC.
 * Calls the getSessionHelper under the hood.
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
		return getSessionHelper(headers);
	},
);
