/// <reference path="../html.d.ts" />
import notFoundHtml from '../html/404.html'
import tokenHtml from '../html/token.html'
import measureHtml from '../html/measure.html'
import { writeTokenToKV, getKeyFromKV, listKeys } from '../src/keys';

export const htmlResponse = (content: string): Response =>
	new Response(content, {
		headers: { 'content-type': 'text/html' },
	})

export const notFoundResponse = (): Response =>
	new Response(notFoundHtml, {
		headers: { 'content-type': 'text/html' },
		status: 404,
	})

export const tokenResponse = (token: string | null): Response =>
	new Response(
		tokenHtml.replace('{{TOKEN}}', token ?? 'No Bearer token provided.'),
		{ headers: { 'content-type': 'text/html' } },
	)

export const getKeyAndMeasurePerformance = async (key: string | null, env: Env): Promise<Response> => {
		const kvGetStart = performance.now();
		const keyName = key ?? 'bearer-token';
		const value = await getKeyFromKV(env, keyName);
		const kvGetMs = Math.round(performance.now() - kvGetStart);
		const html = measureHtml
			.replace('{{KV_GET_MS}}', String(kvGetMs))
			.replace('{{KV_GET_VALUE}}', value ?? 'No value found')
			.replace('{{KV_WRITE_MS}}', '')
			.replace('{{KV_WRITE_VALUE}}', '')
			.replace('{{KV_LIST_MS}}', '')
			.replace('{{KV_LIST_ITEMS}}', '');
		return new Response(html, { headers: { 'content-type': 'text/html' } });
	}

export const putKeyAndMeasurePerformance = async (token: string | null, env: Env): Promise<Response> =>
	{
		const kvWriteStart = performance.now();
		if (token) {
			await writeTokenToKV(env, token, token);
		}
		else {
			await writeTokenToKV(env, "no-token", "no-token");
		}
		const kvWriteMs = Math.round(performance.now() - kvWriteStart);

		const html = measureHtml
			.replace('{{KV_WRITE_MS}}', String(kvWriteMs))
			.replace('{{KV_WRITE_VALUE}}', token ?? 'No token provided')
			.replace('{{KV_GET_MS}}', '')
			.replace('{{KV_GET_VALUE}}', '')
			.replace('{{KV_LIST_MS}}', '')
			.replace('{{KV_LIST_ITEMS}}', '');

		// For debugging or metrics, you might log or process the ms value
		// console.log("KV Write Time (ms):", roundedMs);

		// Optionally, add more headers or processing as needed
		const headers = {
			'content-type': 'text/html',
			'X-KV-Write-Ms': String(kvWriteMs),
		};

		// Return the Response as the result of this function
		return new Response(html, { headers });
	}

export const listKeysAndMeasurePerformance = async (env: Env): Promise<Response> => {
	const kvListStart = performance.now();
	const keyNames = await listKeys(env);
	const kvListMs = Math.round(performance.now() - kvListStart);

	const keysListHtml = keyNames.map(keyName => `
		<li>
			<a href="/keys/${keyName}">${keyName}</a>
		</li>
	`).join('');

	const html = measureHtml
		.replace('{{KV_LIST_MS}}', String(kvListMs))
		.replace('{{KV_LIST_ITEMS}}', keysListHtml)
		.replace('{{KV_GET_MS}}', '')
		.replace('{{KV_GET_VALUE}}', '')
		.replace('{{KV_WRITE_MS}}', '')
		.replace('{{KV_WRITE_VALUE}}', '');
	return new Response(html, { headers: { 'content-type': 'text/html' } });
}
