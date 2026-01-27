/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 */

import { Router } from '../lib/router';
import { htmlResponse } from '../lib/response';
import { files, filesList, filesPost } from './pages/files';


export default {
	async fetch(request, env, ctx): Promise<Response> {
        const router = Router();

		router.get('/', () => htmlResponse('Hello, World!'));

		router.get('/files', () => filesList(request, env));
		router.get('/files/:filename', ({ params }) => files(request, env, params?.filename as string));
		router.post('/files', () => filesPost(request, env));

		// Catch-all route - return 404 if no route matches
		// This allows static assets to be served for unmatched routes
		router.all('*', () => new Response('Not Found', { status: 404 }));

		// In itty-router v5, use router.fetch() instead of router.handle()
		const response = await router.fetch(request, env, ctx);

		// Ensure we always return a Response
		if (!response) {
			return new Response('Internal Server Error', { status: 500 });
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
