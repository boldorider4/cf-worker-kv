/// <reference path="../html.d.ts" />
import notFoundHtml from '../html/404.html'
import tokenHtml from '../html/token.html'
import measureHtml from '../html/measure.html'

export const htmlResponse = (content: string): Response =>
	new Response(content, {
		headers: { 'content-type': 'text/html' },
	})

export const tokenResponse = (token: string | null): Response =>
	new Response(
		tokenHtml.replace('{{TOKEN}}', token ?? 'No Bearer token provided.'),
		{ headers: { 'content-type': 'text/html' } },
	)

export const measurePerformance = (kvWriteMs: number): Response =>
	new Response(measureHtml.replace('{{KV_WRITE_MS}}', String(kvWriteMs)), {
		headers: {
			'content-type': 'text/html',
			'X-KV-Write-Ms': String(kvWriteMs),
		},
	})

export const notFoundResponse = (): Response =>
	new Response(notFoundHtml, {
		headers: { 'content-type': 'text/html' },
		status: 404,
	})
