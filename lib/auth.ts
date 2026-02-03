/**
 * Extracts the Bearer token from a request.
 * Checks in order: Authorization header (Bearer <token>), then URL (?token=... or path /token/<value> or /measure/put/<value>).
 * @returns The token string, or null if missing or malformed
 */
export function getBearerToken(request: Request): string | null {
	const auth = request.headers.get('Authorization');
	if (auth?.startsWith('Bearer ')) {
		const token = auth.slice(7).trim();
		if (token) return token;
	}

	const url = new URL(request.url);
	const queryToken = url.searchParams.get('token');
	if (queryToken?.trim()) return queryToken.trim();

	const pathToken =
		url.pathname.match(/^\/token\/([^/]+)\/?$/)?.[1] ??
		url.pathname.match(/^\/measure\/put\/([^/]+)\/?$/)?.[1];
	if (pathToken?.trim()) return pathToken.trim();

	return null;
}
