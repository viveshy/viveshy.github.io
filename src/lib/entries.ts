type Dated = { data: Record<string, any> };
type Ordered = { data: { order: number; title: string } };
type Draftable = { data: { draft: boolean } };

/**
 * Newest first. Returns a new array; does not mutate the input.
 *
 * `field` exists because collections name their date for what it means:
 * Writing has a `pubDate`, Paper Drops a `readDate`. Sorting is the same
 * operation either way.
 */
export function byNewest<T extends Dated>(entries: T[], field = 'pubDate'): T[] {
	return [...entries].sort(
		(a, b) => b.data[field].valueOf() - a.data[field].valueOf(),
	);
}

/**
 * Drafts are hidden in production builds but visible in `astro dev`,
 * so work in progress can live in the repo without shipping.
 *
 * `isProd` is injected rather than read inline so the behaviour is
 * testable without depending on the ambient build environment.
 *
 * Call as `.filter((e) => isPublished(e))`, never `.filter(isPublished)` —
 * Array.filter passes the element index as the second argument, which
 * would land in `isProd`.
 */
export function isPublished<T extends Draftable>(
	entry: T,
	isProd: boolean = import.meta.env.PROD,
): boolean {
	return isProd ? !entry.data.draft : true;
}
