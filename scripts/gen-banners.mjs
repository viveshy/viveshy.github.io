/**
 * Generates a banner SVG per Writing and Notes entry.
 *
 *   node scripts/gen-banners.mjs [--force]
 *
 * Derived from the entry's title, so a title always produces the same
 * banner and a new post gets one without anybody drawing it.
 *
 * The first attempt at this filled a 32x10 matrix with seeded noise. Every
 * banner came out looking identical, and the reason is worth recording:
 * they shared a grid, a cell size and a density gradient, so only WHICH
 * cells filled varied — and at 120px wide a cell is under 4px, well below
 * the size at which the eye reads that as a different picture. Distinct
 * thumbnails need distinct STRUCTURE, not distinct detail. So the title
 * now picks a motif, and the motif is what differs.
 *
 * Each banner carries its own ground rather than inheriting the page's:
 * these are served through <img>, an isolated document that CSS variables
 * and currentColor cannot reach.
 */
import { readdir, writeFile, stat, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const COLLECTIONS = ['writing', 'notes'];
const W = 640;
const H = 200;

/** FNV-1a — small, deterministic, stable across Node versions. */
function hash(str) {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}

/** mulberry32 — seeded PRNG, so output is reproducible. */
function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Grounds stay in the site's blue-slate family so banners read as a set. */
const SCHEMES = [
	{ bg: '#1b2733', ink: '#8fb8e5', dim: '#38495c' },
	{ bg: '#222a33', ink: '#a8c4dc', dim: '#3f4d5c' },
	{ bg: '#182430', ink: '#7cb0e2', dim: '#334657' },
	{ bg: '#252c35', ink: '#9dbcd8', dim: '#434f5d' },
	{ bg: '#1d2630', ink: '#93b9df', dim: '#3a4757' },
];

/*
 * Five motifs, each with one large-scale form that survives being shrunk
 * to a 120px thumbnail. Every one takes the seeded rand so it varies
 * within its family too.
 */
const MOTIFS = {
	/** Thick diagonals — strongly directional, reads instantly. */
	bands(rand, s) {
		const out = [];
		const step = 44 + Math.floor(rand() * 26);
		const lean = rand() > 0.5 ? 1 : -1;
		for (let x = -H; x < W + H; x += step) {
			const wide = rand() > 0.62;
			out.push(
				`<path d="M${x} 0 l${lean * H} ${H} h${wide ? 26 : 12} l${-lean * H} ${-H} z" ` +
					`fill="${wide ? s.ink : s.dim}"/>`,
			);
		}
		return out;
	},

	/** Concentric arcs from one corner — radial, unmistakable. */
	arcs(rand, s) {
		const out = [];
		const cx = rand() > 0.5 ? 0 : W;
		const cy = rand() > 0.5 ? 0 : H;
		const gap = 30 + Math.floor(rand() * 18);
		for (let r = gap, i = 0; r < W * 1.1; r += gap, i++) {
			out.push(
				`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" ` +
					`stroke="${i % 3 === 0 ? s.ink : s.dim}" stroke-width="${i % 3 === 0 ? 7 : 4}"/>`,
			);
		}
		return out;
	},

	/** Stepped columns — a skyline, or a bar chart. */
	bars(rand, s) {
		const out = [];
		const n = 9 + Math.floor(rand() * 6);
		const cw = W / n;
		for (let i = 0; i < n; i++) {
			const h = 34 + rand() * (H - 46);
			out.push(
				`<rect x="${(i * cw + 5).toFixed(1)}" y="${(H - h).toFixed(1)}" ` +
					`width="${(cw - 10).toFixed(1)}" height="${h.toFixed(1)}" ` +
					`fill="${rand() > 0.68 ? s.ink : s.dim}"/>`,
			);
		}
		return out;
	},

	/** Nested rectangles — layers, tiers, boxes inside boxes. */
	nested(rand, s) {
		const out = [];
		const ox = 30 + rand() * 120;
		const steps = 5 + Math.floor(rand() * 3);
		for (let i = 0; i < steps; i++) {
			const inset = i * (H / (steps * 2.1));
			out.push(
				`<rect x="${(ox + inset * 1.9).toFixed(1)}" y="${(14 + inset).toFixed(1)}" ` +
					`width="${(W - ox * 1.2 - inset * 3.8).toFixed(1)}" ` +
					`height="${(H - 28 - inset * 2).toFixed(1)}" rx="3" fill="none" ` +
					`stroke="${i === 0 ? s.ink : s.dim}" stroke-width="${i === 0 ? 6 : 3.5}"/>`,
			);
		}
		return out;
	},

	/** Nodes and edges — a graph, which suits writing about systems. */
	graph(rand, s) {
		const nodes = [];
		const n = 7 + Math.floor(rand() * 4);
		for (let i = 0; i < n; i++) {
			nodes.push([40 + rand() * (W - 80), 30 + rand() * (H - 60)]);
		}
		const out = [];
		// Connect each node to its nearest neighbour, so edges look
		// intentional rather than random spaghetti.
		for (let i = 0; i < nodes.length; i++) {
			let best = -1;
			let bd = Infinity;
			for (let j = 0; j < nodes.length; j++) {
				if (i === j) continue;
				const d = (nodes[i][0] - nodes[j][0]) ** 2 + (nodes[i][1] - nodes[j][1]) ** 2;
				if (d < bd) [bd, best] = [d, j];
			}
			out.push(
				`<line x1="${nodes[i][0].toFixed(1)}" y1="${nodes[i][1].toFixed(1)}" ` +
					`x2="${nodes[best][0].toFixed(1)}" y2="${nodes[best][1].toFixed(1)}" ` +
					`stroke="${s.dim}" stroke-width="3"/>`,
			);
		}
		for (const [x, y] of nodes) {
			out.push(
				`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${9 + rand() * 7}" fill="${s.ink}"/>`,
			);
		}
		return out;
	},
};

const NAMES = Object.keys(MOTIFS);

function banner(title, motif) {
	const seed = hash(title);
	const rand = rng(seed);
	const scheme = SCHEMES[(seed >>> 8) % SCHEMES.length];

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n` +
		`  <!-- GENERATED by scripts/gen-banners.mjs from the title (motif: ${motif}).\n` +
		`       Safe to replace by hand; the generator skips files that exist. -->\n` +
		`  <rect width="${W}" height="${H}" fill="${scheme.bg}"/>\n` +
		`  <g clip-path="url(#c)">\n` +
		MOTIFS[motif](rand, scheme).map((e) => '    ' + e).join('\n') +
		`\n  </g>\n` +
		`  <clipPath id="c"><rect width="${W}" height="${H}"/></clipPath>\n` +
		`</svg>\n`
	);
}

/** Reads `title:` from frontmatter without pulling in a YAML parser. */
async function titleOf(file) {
	const m = (await readFile(file, 'utf8')).match(/^title:\s*(.+)$/m);
	return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

const force = process.argv.includes('--force');

/*
 * Collect first, then assign. Picking the motif from the hash left
 * collisions to chance — with five motifs and four entries, two pairs came
 * out matching. Round-robin over the entries, sorted by path so the
 * assignment is stable, guarantees every banner differs structurally until
 * there are more entries than motifs.
 */
const found = [];
for (const collection of COLLECTIONS) {
	const base = `src/content/${collection}`;
	for (const entry of await readdir(base, { withFileTypes: true })) {
		const isDir = entry.isDirectory();
		let file;
		if (isDir) {
			const inside = await readdir(join(base, entry.name));
			const idx = inside.find((f) => /^index\.mdx?$/.test(f));
			if (!idx) continue;
			file = join(base, entry.name, idx);
		} else {
			if (!/\.mdx?$/.test(entry.name)) continue;
			file = join(base, entry.name);
		}
		const title = await titleOf(file);
		if (!title) continue;
		found.push({
			title,
			isDir,
			dir: join(base, entry.name),
			out: isDir
				? join(base, entry.name, 'images', 'banner.svg')
				: join(base, `${entry.name.replace(/\.mdx?$/, '')}-banner.svg`),
		});
	}
}

found.sort((a, b) => a.out.localeCompare(b.out));

let written = 0;
let skipped = 0;

for (const [i, e] of found.entries()) {
	const motif = NAMES[i % NAMES.length];

	let exists = false;
	try {
		await stat(e.out);
		exists = true;
	} catch {}
	if (exists && !force) {
		console.log(`  skip   ${e.out}`);
		skipped++;
		continue;
	}

	if (e.isDir) await mkdir(join(e.dir, 'images'), { recursive: true });
	await writeFile(e.out, banner(e.title, motif));
	console.log(`  write  ${motif.padEnd(7)} "${e.title}"`);
	written++;
}

console.log(
	`
${written} written, ${skipped} skipped${force ? '' : ' (pass --force to overwrite)'}`,
);
