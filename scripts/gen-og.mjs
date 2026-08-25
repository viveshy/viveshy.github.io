/**
 * Generates public/og-default.png — the link preview card.
 *
 *   node scripts/gen-og.mjs
 *
 * Social platforms reject SVG for og:image, so this has to be a raster
 * file. No browser or headless Chrome involved: sharp is already a
 * dependency for image optimisation, and it rasterises SVG through
 * librsvg. Text renders because Space Grotesk is installed system-wide —
 * librsvg resolves fonts through fontconfig, not from our woff2, so the
 * family name has to be one fontconfig knows. Verified with `fc-match`.
 *
 * 1200x630 is the size every platform crops from; anything smaller gets
 * upscaled and looks soft in a LinkedIn feed.
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const W = 1200;
const H = 630;

// Cool Mist, matching the site.
const BG = '#f4f7f9';
const INK = '#171b20';
const SOFT = '#586470';
const ACCENT = '#2f5c8f';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Accent bar down the left, echoing the site's single-colour rule. -->
  <rect x="0" y="0" width="14" height="${H}" fill="${ACCENT}"/>

  <!-- The wordmark, drawn as paths so it matches the favicon exactly
       rather than depending on a font for two glyphs. -->
  <g transform="translate(96 92) scale(1.5)">
    <rect width="64" height="64" rx="13" fill="${ACCENT}"/>
    <g fill="none" stroke="${BG}" stroke-width="6" stroke-linecap="butt" stroke-linejoin="miter">
      <path d="M12 23 L20.5 42 L29 23"/>
      <path d="M35 23 L43 41"/>
      <path d="M52 23 L38 53"/>
    </g>
  </g>

  <g font-family="Space Grotesk">
    <text x="96" y="330" font-size="82" font-weight="700" fill="${INK}">Vivesh Yadav</text>
    <text x="96" y="400" font-size="34" font-weight="400" fill="${SOFT}">AI, LLMs, databases, and systems that scale.</text>

    <line x1="96" y1="462" x2="1104" y2="462" stroke="#ccd6de" stroke-width="2"/>

    <text x="96" y="520" font-size="26" font-weight="500" fill="${ACCENT}">viveshy.com</text>
    <text x="1104" y="520" font-size="26" font-weight="400" fill="${SOFT}" text-anchor="end">Writing · Notes · Paper Drops</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg), { density: 144 })
	.resize(W, H)
	.png({ compressionLevel: 9 })
	.toBuffer();

await writeFile('public/og-default.png', png);

const meta = await sharp(png).metadata();
console.log(`wrote public/og-default.png`);
console.log(`  ${meta.width}x${meta.height}  ${(png.length / 1024).toFixed(0)} KB`);
if (meta.width !== W || meta.height !== H) {
	console.error(`  WRONG SIZE — platforms expect ${W}x${H}`);
	process.exit(1);
}
