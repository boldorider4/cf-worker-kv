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

		router.get('/files/.', () => files(request, env));
		router.get('/files/?', () => filesList(request, env));
		router.get('/files/?', () => filesPost(request, env));

		return router.handle(request);
	},
} satisfies ExportedHandler<Env>;
