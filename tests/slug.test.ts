import { describe, expect, it } from 'vitest';
import { cleanSlug } from '../src/lib/slug';

describe('cleanSlug', () => {
	it('strips a leading YYYY-MM-DD- prefix', () => {
		expect(cleanSlug('2026-08-16-why-agents-guess-dates')).toBe(
			'why-agents-guess-dates',
		);
	});

	it('leaves an unprefixed id untouched', () => {
		expect(cleanSlug('attention-is-all-you-need')).toBe(
			'attention-is-all-you-need',
		);
	});

	it('strips only the leading date, not dates later in the slug', () => {
		expect(cleanSlug('2026-08-16-what-changed-in-2025-01-01')).toBe(
			'what-changed-in-2025-01-01',
		);
	});

	it('does not strip a partial or malformed date prefix', () => {
		expect(cleanSlug('2026-8-16-bad-date')).toBe('2026-8-16-bad-date');
	});
});
