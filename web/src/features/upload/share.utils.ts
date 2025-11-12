import { uploadFile } from './upload.utils';
import type { UploadType } from './upload.types';
import { generateId } from '$lib/utils/id';

export type ShareResult = {
	id: string;
	url: string;
};

/**
 * Shares plain text content by turning it into a File and uploading it.
 * Returns a share id (client-generated) and the public URL from the uploader.
 */
export async function uploadMap(
	content: string,
): Promise<ShareResult | null> {
	const id = generateId();
	const safeName = `${id}.grpl`;
	const file = new File([content], safeName, { type: 'text/plain' });
	const url = await uploadFile(file, 'file' satisfies UploadType);
	if (!url) return null;
	return { id, url: `/share/${id}` };
}


