/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 */

import { Router } from '../lib/router';
import { getBearerToken } from '../lib/auth';
import { htmlResponse, notFoundResponse } from '../lib/response';
import { filesList, filesPost } from './pages/files';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Unpack Bearer token from "Authorization: Bearer <token>"
		const token = getBearerToken(request);

		const router = Router();

		router.get('/', () => htmlResponse('Homepage'));

		// Pass request, env, and ctx (ctx includes token) to route handlers
		router.get('/files', (req, e, c) => filesList(req, e, c));
		router.post('/files/?', (req, e, c) => filesPost(req, e, c));

		// Catch-all route - return 404 if no route matches
		// This allows static assets to be served for unmatched routes
		router.all('*', () => notFoundResponse());

		// In itty-router v5, use router.fetch() instead of router.handle()
		// ctx includes token from Authorization: Bearer <token>
		const response = await router.fetch(request, env, { ...ctx, token });

		// Ensure we always return a Response
		if (!response) {
			return notFoundResponse();
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
