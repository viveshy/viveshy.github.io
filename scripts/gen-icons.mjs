/**
 * Rasterises public/favicon.svg into the icons crawlers actually want.
 *
 *   node scripts/gen-icons.mjs
 *
 * Google was showing a globe instead of the mark, for three reasons:
 *
 *   1. /favicon.ico returned 404. Google's crawler looks for that exact
 *      root path, and a missing one is the common cause of a globe.
 *   2. The only declared icon was SVG. Google documents SVG as supported,
 *      but plenty of crawlers and link-preview services still do not
 *      rasterise it, so a raster fallback is not optional in practice.
 *   3. The SVG viewBox is 64x64. Google asks for a square that is a
 *      MULTIPLE OF 48 — 48, 96, 144 — so 64 was off-spec even where the
 *      SVG was read.
 *
 * sharp handles the rasterising (already a dependency). ICO it cannot
 * write, so the container is assembled here: an .ico is a small header
 * plus, since Vista, embedded PNG payloads.
 *
 * Google recrawls on its own schedule, so expect days to weeks before
 * search results update — the fix is necessary, not instant.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');

/** Multiples of 48, per Google's guidance. */
const PNG_SIZES = [48, 96, 192];
/** What the .ico carries: 16 and 32 for browser tabs, 48 for Google. */
const ICO_SIZES = [16, 32, 48];

const render = (size) =>
	sharp(svg, { density: 384 })
		.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png({ compressionLevel: 9 })
		.toBuffer();

/**
 * Builds an .ico containing PNG payloads.
 *
 * Layout: a 6-byte ICONDIR, then one 16-byte ICONDIRENTRY per image, then
 * the payloads. A width/height byte of 0 means 256; every size here is
 * below that, so they are written literally.
 */
function ico(images) {
	const count = images.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // 1 = icon
	header.writeUInt16LE(count, 4);

	const entries = [];
	let offset = 6 + count * 16;
	for (const { size, data } of images) {
		const e = Buffer.alloc(16);
		e.writeUInt8(size >= 256 ? 0 : size, 0); // width
		e.writeUInt8(size >= 256 ? 0 : size, 1); // height
		e.writeUInt8(0, 2); // palette count, 0 for true colour
		e.writeUInt8(0, 3); // reserved
		e.writeUInt16LE(1, 4); // colour planes
		e.writeUInt16LE(32, 6); // bits per pixel
		e.writeUInt32LE(data.length, 8);
		e.writeUInt32LE(offset, 12);
		entries.push(e);
		offset += data.length;
	}

	return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// --- PNGs, including the one Apple and Android look for ---------------
for (const size of PNG_SIZES) {
	const data = await render(size);
	await writeFile(`public/favicon-${size}x${size}.png`, data);
	console.log(`  favicon-${size}x${size}.png   ${(data.length / 1024).toFixed(1)} KB`);
}

const apple = await render(180);
await writeFile('public/apple-touch-icon.png', apple);
console.log(`  apple-touch-icon.png    ${(apple.length / 1024).toFixed(1)} KB  (180x180, Apple's size)`);

// --- the .ico Google reaches for first --------------------------------
const packed = [];
for (const size of ICO_SIZES) packed.push({ size, data: await render(size) });
const icoBuf = ico(packed);
await writeFile('public/favicon.ico', icoBuf);
console.log(`  favicon.ico             ${(icoBuf.length / 1024).toFixed(1)} KB  (${ICO_SIZES.join(', ')}px)`);
