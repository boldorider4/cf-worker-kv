/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 */

import { Router } from '../lib/router';
import { getBearerToken } from '../lib/auth';
import { htmlResponse, notFoundResponse, tokenResponse } from '../lib/response';
import { filesList, filesPost } from './pages/files';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Unpack and process Bearer token from "Authorization: Bearer <token>"
		const token = getBearerToken(request);
		// Process token here (e.g. validate, log); not passed to routes

		const router = Router();

		router.get('/', () => htmlResponse('Homepage'));
		router.get('/token', () => tokenResponse(token));

		router.get('/files', () => filesList(request, env));
		router.post('/files/?', () => filesPost(request, env));

		// Catch-all route - return 404 if no route matches
		// This allows static assets to be served for unmatched routes
		router.all('*', () => notFoundResponse());

		// In itty-router v5, use router.fetch() instead of router.handle()
		const response = await router.fetch(request, env, ctx);

		// Ensure we always return a Response
		if (!response) {
			return notFoundResponse();
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
