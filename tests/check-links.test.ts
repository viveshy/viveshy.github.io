import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkLinks } from '../scripts/check-links.mjs';

async function fixture(files: Record<string, string>) {
	const dir = await mkdtemp(join(tmpdir(), 'links-'));
	for (const [path, html] of Object.entries(files)) {
		const full = join(dir, path);
		await mkdir(join(full, '..'), { recursive: true });
		await writeFile(full, html);
	}
	return dir;
}

describe('checkLinks', () => {
	it('reports nothing when every internal link resolves', async () => {
		const dir = await fixture({
			'index.html': '<a href="/blog/">Blog</a>',
			'blog/index.html': '<a href="/">Home</a>',
		});
		expect(await checkLinks(dir)).toEqual([]);
	});

	it('reports a link with no matching output file', async () => {
		const dir = await fixture({
			'index.html': '<a href="/blog/missing/">Missing</a>',
		});
		const broken = await checkLinks(dir);
		expect(broken).toHaveLength(1);
		expect(broken[0].href).toBe('/blog/missing/');
	});

	it('ignores external links, anchors, and mailto', async () => {
		const dir = await fixture({
			'index.html':
				'<a href="https://github.com">gh</a><a href="#top">top</a><a href="mailto:a@b.c">mail</a>',
		});
		expect(await checkLinks(dir)).toEqual([]);
	});

	it('resolves a link to a direct file such as rss.xml', async () => {
		const dir = await fixture({
			'index.html': '<a href="/rss.xml">RSS</a>',
			'rss.xml': '<rss></rss>',
		});
		expect(await checkLinks(dir)).toEqual([]);
	});

	it('strips query strings and hashes before resolving', async () => {
		const dir = await fixture({
			'index.html': '<a href="/blog/?x=1#section">Blog</a>',
			'blog/index.html': 'ok',
		});
		expect(await checkLinks(dir)).toEqual([]);
	});
});
