import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { json } from '@sveltejs/kit';
import {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL
} from '$env/static/private';
import { env } from '$env/dynamic/private';
import { isUploadType } from '../../../features/upload/upload.types.js';
import { fileToType } from '../../../features/upload/upload.utils.js';
import { generateId } from '$lib/utils/id.js';

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
    // Authorization: Bearer <token>
    const auth = request.headers.get('authorization') || '';
    const expected = env.UPLOAD_MASTER_TOKEN || '';
    if (!auth || !expected || auth !== `Bearer ${expected}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    const form = await request.formData();
    const file = form.get('file');
    const type = form.get('type');

    if (!isUploadType(type)) {
        return new Response('Invalid type', { status: 400 });
    }


    if (!(file instanceof File)) {
        return new Response('Missing file', { status: 400 });
    }


    if (await fileToType(file) !== type) {
        return new Response('Invalid file type')
    }

    const bytes = await file.arrayBuffer();
    const extFromName = file.name?.includes('.') ? '.' + file.name.split('.').pop() : '';
    const extFromType = file.type && file.type.includes('/') ? '.' + file.type.split('/')[1] : '';
    const ext = extFromName || extFromType || '';
    const id = generateId();
    const key = `${type}/${id}${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: Buffer.from(bytes),
            ContentType: file.type || 'application/octet-stream'
        })
    );

    const url = `${R2_PUBLIC_BASE_URL}/${key}`;
    return json({ url, id });
};