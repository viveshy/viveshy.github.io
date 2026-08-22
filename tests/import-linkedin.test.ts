import { describe, expect, it } from 'vitest';
import {
	slugify,
	parseArticle,
	htmlToMarkdown,
} from '../scripts/import-linkedin.mjs';

describe('slugify', () => {
	it('lowercases and hyphenates', () => {
		expect(slugify('What Separates a Good Data Product')).toBe(
			'what-separates-a-good-data-product',
		);
	});

	it('drops punctuation and collapses runs', () => {
		expect(slugify("LLM Does Not Know Your Business — Part 1!")).toBe(
			'llm-does-not-know-your-business-part-1',
		);
	});
});

describe('parseArticle', () => {
	// Matches the real export exactly: the date lines are <p>, not <div>.
	const html = `<html><head><title>A Title</title><style>p{margin:0}</style></head>
	<body><h1><a href="https://www.linkedin.com/pulse/a-title-abc">A Title</a></h1>
	<p class="created">Created on 2025-06-24 14:30</p>
	<p class="published">Published on 2025-06-25 15:42</p>
	<p>First paragraph.</p></body></html>`;

	it('pulls the title', () => {
		expect(parseArticle(html).title).toBe('A Title');
	});

	it('pulls the canonical URL from the h1 link', () => {
		expect(parseArticle(html).canonicalUrl).toBe(
			'https://www.linkedin.com/pulse/a-title-abc',
		);
	});

	it('prefers the published date over the created date', () => {
		expect(parseArticle(html).pubDate).toBe('2025-06-25');
	});

	it('strips head, style, h1, and the date lines from the body', () => {
		const body = parseArticle(html).bodyHtml;
		expect(body).not.toContain('<style');
		expect(body).not.toContain('<h1');
		expect(body).not.toContain('Published on');
		expect(body).not.toContain('Created on');
		expect(body).toContain('First paragraph.');
	});

	// Regression: the strip regex assumed <div>, so with the real <p> markup
	// the date lines survived into the body and became the description.
	it('leaves the first real paragraph as the body opener', () => {
		expect(htmlToMarkdown(parseArticle(html).bodyHtml)).toBe('First paragraph.');
	});
});

describe('htmlToMarkdown', () => {
	it('converts paragraphs and headings', () => {
		expect(htmlToMarkdown('<h2>Heading</h2><p>Text here.</p>')).toBe(
			'## Heading\n\nText here.',
		);
	});

	/*
	 * Regression: LinkedIn emits <strong>Heading:  </strong> with trailing
	 * spaces inside the tag. Emitting `**Heading:  **` is invalid Markdown —
	 * a closing delimiter must be preceded by non-whitespace — so the
	 * asterisks rendered literally on the page.
	 */
	it('moves whitespace outside emphasis delimiters', () => {
		expect(htmlToMarkdown('<p><strong>Heading:  </strong>Body text.</p>')).toBe(
			'**Heading:** Body text.',
		);
	});

	it('handles leading whitespace inside emphasis too', () => {
		expect(htmlToMarkdown('<p>a <em> soft </em>b</p>')).toBe('a *soft* b');
	});

	it('drops emphasis tags that contain only whitespace', () => {
		expect(htmlToMarkdown('<p>a <strong> </strong>b</p>')).toBe('a b');
	});

	it('converts strong, em, and links', () => {
		expect(
			htmlToMarkdown('<p>A <strong>bold</strong> <em>soft</em> <a href="https://x.com">link</a>.</p>'),
		).toBe('A **bold** *soft* [link](https://x.com).');
	});

	it('converts unordered and ordered lists', () => {
		expect(htmlToMarkdown('<ul><li>one</li><li>two</li></ul>')).toBe(
			'- one\n- two',
		);
		expect(htmlToMarkdown('<ol><li>one</li><li>two</li></ol>')).toBe(
			'1. one\n2. two',
		);
	});

	it('converts blockquotes and rules', () => {
		expect(htmlToMarkdown('<blockquote>Quoted.</blockquote>')).toBe('> Quoted.');
		expect(htmlToMarkdown('<hr/>')).toBe('---');
	});

	it('converts pre blocks to fenced code', () => {
		expect(htmlToMarkdown('<pre>let x = 1;</pre>')).toBe(
			'```\nlet x = 1;\n```',
		);
	});

	it('unescapes entities', () => {
		expect(htmlToMarkdown('<p>a &amp; b &mdash; c &#39;d&#39;</p>')).toBe(
			"a & b — c 'd'",
		);
	});

	it('drops empty paragraphs and stray tags', () => {
		expect(htmlToMarkdown('<p></p><p>Real.</p><div></div>')).toBe('Real.');
	});
});
