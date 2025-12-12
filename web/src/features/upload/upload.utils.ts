import { fileTypeFromBlob } from 'file-type';
import { toast } from 'svelte-sonner';
import type { ShareResult } from './share.utils';
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from './upload.constants';
import type { DetectedType, UploadType } from './upload.types';

export async function uploadFile(file: File, type: UploadType): Promise<ShareResult | null> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('upload_token') : null;
	if (!token && type !== "file") {
		toast.error('Uploads require a personal token. Visit /auth/set-token first.');
		return null;
	}
	const form = new FormData();
	form.set('file', file);
	form.set('type', type);
	const res = await fetch('/api/upload', {
		method: 'POST',
		body: form,
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!res.ok) {
		// Read error body as JSON or text and toast it
		let message = 'Upload failed';
		message = (await res.text().catch(() => '')) || message;
		toast.error(message);
		return null;
	}
	const data = (await res.json()) as ShareResult;
	return data;
}

export const fileToType = async (file: File): Promise<UploadType> => {
	const detected = await sniffFileType(file);
	const mime = detected?.mime || file.type || '';
	const ext = detected?.ext;

	if (
		mime.startsWith('video/') ||
		mime.startsWith('audio/') ||
		mime === 'application/ogg' ||
		(ext && (VIDEO_EXTENSIONS.has(ext) || AUDIO_EXTENSIONS.has(ext)))
	) {
		return 'clip';
	}

	if (mime.startsWith('image/') || (ext && IMAGE_EXTENSIONS.has(ext))) {
		return 'image';
	}
	if (await isPlainTextFile(file)) {
		return 'file';
	}

	throw new Error('No type found');
};

export async function sniffFileType(file: File): Promise<DetectedType> {
	const detected = await fileTypeFromBlob(file);
	if (!detected) return null;
	return { mime: detected.mime, ext: detected.ext };
}

export async function isPlainTextFile(file: File): Promise<boolean> {
	// Prefer library detection if available
	const detected = await fileTypeFromBlob(file);
	if (detected) {
		return detected.mime === 'text/plain';
	}
	// Fallback: heuristic check for UTF-8 decodability and absence of NUL bytes
	const headSize = Math.min(file.size, 4096);
	if (headSize === 0) return true; // empty files treated as plain text
	const buf = new Uint8Array(await file.slice(0, headSize).arrayBuffer());
	for (let i = 0; i < buf.length; i++) {
		if (buf[i] === 0x00) return false;
	}
	try {
		new TextDecoder('utf-8', { fatal: true }).decode(buf);
		return true;
	} catch {
		return false;
	}
}
