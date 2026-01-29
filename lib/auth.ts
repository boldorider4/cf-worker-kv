/**
 * Extracts the Bearer token from a request's Authorization header.
 * Expects header format: "Authorization: Bearer <token>"
 * @returns The token string, or null if missing or malformed
 */
export function getBearerToken(request: Request): string | null {
	const auth = request.headers.get('Authorization');
	if (!auth || !auth.startsWith('Bearer ')) {
		return null;
	}
	return auth.slice(7).trim() || null;
}

/**
 * Headers for outgoing requests with Bearer auth and Cloudflare Worker user agent.
 * Use when forwarding the token to another API, e.g. fetch(url, { headers: bearerHeaders(token) }).
 */
export function bearerHeaders(token: string): HeadersInit {
	return {
		Authorization: `Bearer ${token}`,
		'User-Agent': 'cloudflare-worker',
	};
}
