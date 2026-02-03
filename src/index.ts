/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 */

import { Router } from '../lib/router';
import { getBearerToken } from '../lib/auth';
import { htmlResponse, measurePerformance, notFoundResponse, tokenResponse } from '../lib/response';
import { keysList, keysPost, writeTokenToKV } from './pages/keys';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Unpack and process Bearer token from "Authorization: Bearer <token>"
		const token = getBearerToken(request);
		const kvWriteStart = performance.now();
		if (token) {
			await writeTokenToKV(env, token, token);
		}
		else {
			await writeTokenToKV(env, "no-token", "no-token");
		}
		const kvWriteMs = Math.round(performance.now() - kvWriteStart);

		const router = Router();

		router.get('/', () => htmlResponse('Homepage'));
		router.get('/token', () => tokenResponse(token));
		router.get('/measure', () => measurePerformance(kvWriteMs));

		router.get('/keys', () => keysList(request, env));
		router.post('/keys/?', () => keysPost(request, env));

		// Catch-all route - return 404 if no route matches
		// This allows static assets to be served for unmatched routes
		router.all('*', () => notFoundResponse());

		// In itty-router v5, use router.fetch() instead of router.handle()
		let response = await router.fetch(request, env, ctx);

		// Ensure we always return a Response
		if (!response) {
			return notFoundResponse();
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
