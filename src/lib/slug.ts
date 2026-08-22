const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/**
 * Content folders are named `YYYY-MM-DD-slug` so they sort chronologically
 * on disk, but that date must never leak into the URL.
 */
export function cleanSlug(id: string): string {
	return id.replace(DATE_PREFIX, '');
}
