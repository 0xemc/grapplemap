export const file_types = ['file', 'clip', 'image'] as const;
export type UploadType = (typeof file_types)[number];

export function isUploadType(v: unknown): v is UploadType {
	return typeof v === 'string' && (file_types as readonly string[]).includes(v);
}

export type DetectedType = { mime: string; ext?: string } | null;
