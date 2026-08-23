import { describe, expect, it } from 'vitest';
import { byNewest, isPublished } from '../src/lib/entries';

const entry = (id: string, iso: string, draft = false) => ({
	id,
	data: { pubDate: new Date(iso), draft },
});

describe('byNewest', () => {
	it('sorts newest first', () => {
		const sorted = byNewest([
			entry('old', '2024-01-01'),
			entry('new', '2026-08-16'),
			entry('mid', '2025-06-01'),
		]);
		expect(sorted.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
	});

	it('does not mutate the input array', () => {
		const input = [entry('a', '2024-01-01'), entry('b', '2026-01-01')];
		byNewest(input);
		expect(input.map((e) => e.id)).toEqual(['a', 'b']);
	});
});

describe('byNewest with a custom date field', () => {
	const r = (id: string, iso: string) => ({ id, data: { readDate: new Date(iso) } });

	it('sorts on the named field', () => {
		const sorted = byNewest(
			[r('old', '2024-01-01'), r('new', '2026-08-18'), r('mid', '2025-06-01')],
			'readDate',
		);
		expect(sorted.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
	});
});

describe('isPublished', () => {
	it('keeps non-drafts in production', () => {
		expect(isPublished(entry('a', '2026-01-01', false), true)).toBe(true);
	});

	it('drops drafts in production', () => {
		expect(isPublished(entry('a', '2026-01-01', true), true)).toBe(false);
	});

	it('keeps drafts in dev so work in progress stays visible', () => {
		expect(isPublished(entry('a', '2026-01-01', true), false)).toBe(true);
	});
});
