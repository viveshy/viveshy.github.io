import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const HREF = /href="([^"]+)"/g;

async function htmlFiles(dir) {
	const found = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
		else if (entry.name.endsWith('.html')) found.push(full);
	}
	return found;
}

async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Returns every internal href in `distDir` that has no corresponding
 * output file. An empty array means the site has no broken internal links.
 */
export async function checkLinks(distDir) {
	const root = resolve(distDir);
	const broken = [];

	for (const file of await htmlFiles(root)) {
		const html = await readFile(file, 'utf8');
		for (const [, raw] of html.matchAll(HREF)) {
			// Skip anything that does not point inside this site.
			if (!raw.startsWith('/')) continue;
			if (raw.startsWith('//')) continue;

			const path = raw.split('#')[0].split('?')[0];
			if (path === '' || path === '/') continue;

			const target = join(root, path);
			const ok =
				(await exists(target)) ||
				(await exists(join(target, 'index.html'))) ||
				(await exists(`${target}.html`));

			if (!ok) broken.push({ file: file.slice(root.length + 1), href: raw });
		}
	}

	return broken;
}

// CLI entry point.
if (process.argv[1] && process.argv[1].endsWith('check-links.mjs')) {
	const dir = process.argv[2] ?? 'dist';
	const broken = await checkLinks(dir);
	if (broken.length > 0) {
		console.error(`${broken.length} broken internal link(s):`);
		for (const b of broken) console.error(`  ${b.file} → ${b.href}`);
		process.exit(1);
	}
	console.log('All internal links resolve.');
}
