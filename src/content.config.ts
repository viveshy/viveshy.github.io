import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imported from zod directly — re-exporting `z` from `astro:content` is
// deprecated in Astro 7. Same hoisted instance Astro itself uses.
import { z } from 'zod';

/**
 * Shared by the dated collections. `pubDate` means "when this was
 * published to the site" — for papers and books, when it was read. It is
 * the sort key everywhere it appears.
 */
const base = {
	title: z.string(),
	description: z.string().optional(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	draft: z.boolean().default(false),
};

/** Writing — everything from a two-paragraph piece to a long essay. */
const writing = defineCollection({
	loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			...base,
			description: z.string(),
			heroImage: image().optional(),
			// Set for pieces republished from elsewhere (e.g. a LinkedIn
			// article) so search engines credit the original instead of
			// splitting rank between two copies.
			canonicalUrl: z.url().optional(),
		}),
});

/**
 * Notes are shorter and rougher than Writing, but they are dated the same
 * way — one rule across the site rather than a special case. `description`
 * stays optional, since a note is often shorter than a summary of it.
 */
const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			...base,
			heroImage: image().optional(),
		}),
});

/**
 * Paper Drops are a reading log. Each row opens the PDF on Drive in a new
 * tab; there are no detail pages here.
 *
 * The date is `readDate`, not `pubDate`, and it is named for exactly what
 * it is — when the paper was read. That is the sort key, newest first.
 * The paper's own publication year is a separate `year` field, shown but
 * never sorted on.
 */
const papers = defineCollection({
	loader: glob({ base: './src/content/papers', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		/** When I read it. Sort key, newest first. */
		readDate: z.coerce.date(),
		draft: z.boolean().default(false),
		authors: z.array(z.string()).default([]),
		/** The paper's own publication year — displayed, never sorted on. */
		year: z.number(),
		venue: z.string().optional(),
		/** The PDF on Google Drive. Where the row points. */
		driveUrl: z.url(),
		/** Optional link to the original, e.g. arXiv. */
		url: z.url().optional(),
	}),
});

const books = defineCollection({
	loader: glob({ base: './src/content/books', pattern: '**/*.md' }),
	schema: z.object({
		...base,
		author: z.string(),
		rating: z.number().int().min(1).max(5),
		year: z.number().optional(),
	}),
});

export const collections = { writing, notes, papers, books };
