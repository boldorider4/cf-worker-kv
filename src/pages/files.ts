import { htmlResponse, notFoundResponse } from '../../lib/response';


const files = async (request: Request, env: Env, filename?: string) => {
    if (!filename) {
        return notFoundResponse();
    }
    const content = await env.APIKEYS.get(filename);
    if (!content) {
        return notFoundResponse();
    }
	return htmlResponse(`File ${filename} with content ${content}`);
}

const filesToLi = (file: string) => {
    return `
        <li>
            <a href="/files/${file}">${file}</a>
        </li>
    `;
}

const filesList = async (request: Request, env: Env) => {
    const filesFromApiKeys = await env.APIKEYS.get('files', { type: 'json' }) as string[] | null;
    if (!filesFromApiKeys) {
        return htmlResponse('<ul>found nothing</ul>');
    }
    const filesList = filesFromApiKeys.map(filesToLi).join('');
    const html = `<ul>${filesList}</ul>`;
	return htmlResponse(html);
}

const filesPost = async (request: Request, env: Env) => {
    try {
        const { filename, content } = await request.json() as { filename: string, content: string };
        if (!filename || content === undefined) {
            return new Response('Missing filename or content', { status: 400 });
        }
        
        // Store the file content
        await env.APIKEYS.put(filename, content);
        
        // Update the files list
        const filesFromApiKeys = await env.APIKEYS.get('files', { type: 'json' }) as string[] | null;
        const filesList = filesFromApiKeys || [];
        if (!filesList.includes(filename)) {
            filesList.push(filename);
            await env.APIKEYS.put('files', JSON.stringify(filesList));
        }
        
        return htmlResponse(`File ${filename} created`);
    } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
    }
}

export { files, filesList, filesPost };