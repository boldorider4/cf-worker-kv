import { htmlResponse } from '../../lib/response';

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

const keysToLi = (keyName: string) => {
    return `
        <li>
            <a href="/keys/${keyName}">${keyName}</a>
        </li>
    `;
}

const keysList = async (request: Request, env: Env) => {
	const keysFromApiKeys = await env.APIKEYS.list();
	const keyNames = keysFromApiKeys.keys.map(k => k.name);
	const keysListHtml = keyNames.map(keysToLi).join('');
	const html = `<ul>${keysListHtml}</ul>`;

	return htmlResponse(html);
}

const keysPost = async (request: Request, env: Env) => {
    try {
        const { keyname, content } = await request.json() as { keyname: string, content: string };
        if (!keyname || content === undefined) {
            return new Response('Missing keyname or content', { status: 400 });
        }
        
        // Store the key content
        await env.APIKEYS.put(keyname, content);
        
        // Update the keys list
        const keysFromApiKeys = await env.APIKEYS.get('keys', { type: 'json' }) as string[] | null;
        const keysList = keysFromApiKeys || [];
        if (!keysList.includes(keyname)) {
            keysList.push(keyname);
            await env.APIKEYS.put('keys', JSON.stringify(keysList));
        }
        
        return htmlResponse(`Key ${keyname} created`);
    } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
    }
}

export { keysList, keysPost };