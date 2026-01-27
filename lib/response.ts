/// <reference path="../html.d.ts" />
import okHtml from '../html/index.html'
import notFoundHtml from '../html/404.html'

export const htmlResponse = (content: string): Response =>
	new Response(content, {
		headers: { 'content-type': 'text/html' },
	})

export const notFoundResponse = (): Response =>
	new Response(notFoundHtml, {
		headers: { 'content-type': 'text/html' },
		status: 404,
	})
