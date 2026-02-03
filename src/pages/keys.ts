/**
 * Writes a token to KV storage (env.APIKEYS).
 * @param env - Worker env; uses env.APIKEYS
 * @param token - The token string to store
 * @param key - Optional key; defaults to "bearer-token"
 */
export async function writeTokenToKV(
	env: Env,
	token: string,
	key: string,
): Promise<void> {
	await env.APIKEYS.put(key, token);
}

/**
 * Gets a key from KV storage (env.APIKEYS).
 * @param env - Worker env; uses env.APIKEYS
 * @param key - The key to get
 */
export async function getKeyFromKV(
	env: Env,
	key: string,
): Promise<string | null> {
	return await env.APIKEYS.get(key);
}

/**
 * Lists all keys in KV storage (env.APIKEYS).
 * Returns the key names as an array of strings.
 * @param env - Worker env; uses env.APIKEYS
 */
export async function listKeys(env: Env): Promise<string[]> {
	const keysFromApiKeys = await env.APIKEYS.list();
	return keysFromApiKeys.keys.map(k => k.name);
}