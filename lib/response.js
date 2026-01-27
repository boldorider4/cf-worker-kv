import okHtml from '../html/index.html'
import notFoundHtml from '../html/404.html'

export const htmlResponse = () =>
	new Response(okHtml, {
		headers: { 'content-type': 'text/html' },
	})

export const notFoundResponse = () =>
	new Response(notFoundHtml, {
		headers: { 'content-type': 'text/html' },
		status: 404,
	})