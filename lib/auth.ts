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
