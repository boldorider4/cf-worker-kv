import { htmlResponse } from '../../lib/response';


const filesToLi = (file: string) => {
    return `
        <li>
            <a href="/files/${file}">${file}</a>
        </li>
    `;
}

const filesList = async (request: Request, env: Env) => {
    const filesFromApiKeys = await env.APIKEYS.list();
	const files = filesFromApiKeys.keys.map(key => key.name);
	const filesListHtml = files.map(filesToLi).join('');
	const html = `<ul>${filesListHtml}</ul>`;

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

export { filesList, filesPost };