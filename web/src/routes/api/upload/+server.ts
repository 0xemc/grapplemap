import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { json } from '@sveltejs/kit';
import {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL
} from '$env/static/private';

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
});

export const POST = async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file');
    let path = form.get('path')?.toString() ?? '';
    // Remove leading/trailing spaces, leading '/', dots, backslashes, and anything not alphanumeric, underscore, dash, or forward slash
    path = path
        .replace(/^[/\\.\s]+|[/\\.\s]+$/g, '') // Remove leading/trailing /, \, ., or spaces
        .replace(/[^a-zA-Z0-9/_-]/g, '')      // Allow only certain chars
        .replace(/\/{2,}/g, '/');             // Collapse multiple slashes
    if (!path || path.length > 128) {
        return new Response('Invalid path', { status: 400 });
    }

    if (!(file instanceof File)) {
        return new Response('Missing file', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const extFromName = file.name?.includes('.') ? '.' + file.name.split('.').pop() : '';
    const extFromType = file.type && file.type.includes('/') ? '.' + file.type.split('/')[1] : '';
    const ext = extFromName || extFromType || '';
    const key = `${path}/${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2))}${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: Buffer.from(bytes),
            ContentType: file.type || 'application/octet-stream'
        })
    );

    const url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return json({ url, key });
};