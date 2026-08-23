# viveshy.com

Personal site — writing, notes, paper drops, book drops.
Astro 7, static, deployed to GitHub Pages.

## Develop

```bash
bun install
bun run dev      # drafts are visible here
```

## Verify

```bash
bun run test         # unit tests for lib/ and scripts/
bun run check        # types + content schema validation
bun run build
bun run check:links
```

## Publish

Push to `main`. GitHub Actions builds and deploys.

## Writing

| Section | URL | Location | Format |
|---|---|---|---|
| Writing | `/writing/` | `src/content/writing/YYYY-MM-DD-slug/index.mdx` | folder + `images/` |
| Notes | `/notes/` | `src/content/notes/slug.md` | single file, **no date** |
| Paper Drops | `/papers/` | `src/content/papers/slug.md` | single file, links **out** to Drive |
| Book Drops | `/books/` | `src/content/books/slug.md` | single file |

**Paper Drops** are a reading log. Each row opens `driveUrl` — the PDF on
Google Drive — in a new tab; there are no pages here. Sorted by
`readDate`, newest read first. That field is named for what it is; the
paper's own publication year is the separate `year` field, shown but
never sorted on. `url` optionally points at the original (arXiv, etc.).

Drive files need sharing set to **"Anyone with the link"**, or visitors
land on a request-access screen.

**Writing** is dated and stacked newest-first — anything from a couple of
paragraphs to a long essay.

**Notes** are principles you stand for and advocate — positions, not
write-ups. Short and assertive, one claim per note. The idea is borrowed
from [leerob.com](https://leerob.com)'s beliefs page.

Both are dated and sorted newest first. Notes make `description`
optional, since a principle is often shorter than a summary of it.

There is no RSS feed.

### Two entry shapes

Every collection accepts both, mixed freely — same as arnav.tech:

```
src/content/essays/
├── 2026-08-10-a-flat-entry.md          ← no assets, single file
└── 2026-08-16-hello/                   ← has assets, folder
    ├── index.mdx
    └── images/cover.png
```

Both publish to the same clean URL (`/essays/a-flat-entry/`,
`/essays/hello/`) with the date prefix stripped. Reference a co-located
image relatively and Astro optimizes it:

```yaml
heroImage: ./images/cover.png
```

That emits WebP at multiple widths with a responsive `srcset` and
explicit dimensions, so there is no layout shift. Inline images in the
body work the same way. Start flat; promote to a folder when a piece
gains its first image.

**SVG works in the same folder** and is preferred for diagrams —
architecture sketches, flowcharts, anything with text in it. Astro
optimizes it and it stays sharp at any zoom, where a screenshot of a
diagram goes soft:

```
src/content/essays/2026-08-16-hello/
├── index.mdx          heroImage: ./images/diagram.svg
└── images/diagram.svg
```

**For diagrams that must follow the theme, inline the SVG** rather than
pointing `heroImage` at it. An SVG loaded through `<img>` is an isolated
document: `currentColor` and CSS variables never reach it, so the only
theming left is `prefers-color-scheme` — which follows the *OS*, not this
site's toggle. Get those out of step and the diagram paints near-white
text onto light paper.

Inlining means the post is `.mdx` and the SVG is imported as a component:

```mdx
import RagDiagram from './images/rag-finops.svg';

<RagDiagram class="diagram" />
```

Then use `currentColor` for text and `var(--link, #16619f)` style values
for strokes — the literal fallback keeps the file correct if opened on
its own. The `.diagram` class handles sizing and breaks the figure out
past the reading measure so it stays legible.

## Importing from LinkedIn

```bash
node scripts/import-linkedin.mjs <exportDir> <collection> [--dry-run]
```

Converts a LinkedIn article export to Markdown entries, sets
`canonicalUrl` to the original so search rank is not split, and downloads
inline images locally — LinkedIn's CDN URLs are signed and expire.

Display names and URLs differ on purpose — the URLs stay short. Wrap a
pull-out claim in `<div class="maxim">…</div>` for the gold callout.

The date prefix sorts files on disk and is stripped from the URL.
Set `draft: true` to keep something out of production.

Design decisions live in `docs/superpowers/specs/`.
