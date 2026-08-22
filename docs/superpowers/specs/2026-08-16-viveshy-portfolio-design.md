# viveshy.com — Personal Site Design

> **SUPERSEDED — historical record only.**
>
> This describes the site as designed in August 2026. It has since
> changed substantially and is kept for the reasoning, not as a
> description of what exists. Notably gone: tag pages, RSS, the
> Essays/Shorts/Tech Posts split (now one Writing section), Projects and
> Talks. Paper Drops link out to Drive rather than having pages. The
> palette is one accent with no link blue. Read the code, not this.


**Date:** 2026-08-16
**Status:** Implemented
**Repo:** `/home/vivesh-cn/Personal/Cruise/viveshy`

## Amendments after implementation

- **2026-08-17 — tags removed.** Cross-collection tag pages, the `tags`
  frontmatter field, and the nav entry are all gone at the owner's
  request. `src/lib/tags.ts` and its tests were deleted. Re-adding would
  mean restoring the field in the base schema plus two page files.
- **2026-08-17 — accent desaturated**, then superseded by the item below.
- **2026-08-17 — visual system matched to arpitbhayani.me.** The original
  decision was "same layout language, our own palette and type". The owner
  asked three times for it to match the reference directly, so it now does.
  Values extracted from his compiled CSS, not eyeballed:
  - Palette light `#faf9f6` paper / `#333` ink / `#aeaeae`–`#cecece` rules;
    dark `#1a1a1a` / `#2d2d2d` / `#e0e0e0` / `#444`–`#555`.
  - Links `#2222ff` light, `#6ba3ff` dark. **Correction to an earlier
    claim in conversation:** his body links are *not* near-black — that
    was inferred from the absence of a link-color variable. The colour
    comes from Bulma's base rule `a { color:#22f }`.
  - Gold `#cc9900` is reserved for the `.maxim` callout (2px left rule on
    `#fffdf0`), his only accent use.
  - 40px graph-paper background: two 1px linear-gradients at
    `rgba(0,0,0,.025)`, `background-size: 40px 40px`.
  - Typeface **Assistant** as a single family; no mono webfont, code falls
    back to a system mono stack, as his does.
  - `line-height: 1.5`, container `960px`, prose `68ch` (his blog prose
    sits in a Bulma `is-8` column of a 960px container — about 640px, so
    the original reading measure already matched).
  - Theme toggle reduced to his two-state sun/moon, defaulting to light.
    The pre-paint script defaults to light to match, or a system-dark
    visitor would see a flash when the toggle repainted after hydration.
  - Footer became grouped link columns; teasers use his
    "Heading • Link ➔" format with a one-line blurb beneath.
  Contrast measured: links 7.28:1 light and 6.89:1 dark, ink 12.0:1 and
  13.2:1 — all AA. Gold-on-cream is 2.53:1 but is a border, not text.
  Result is a 4.7 KB stylesheet against his 242 KB.
- **2026-08-17 — background is engineering paper, not his graph paper.**
  His 40px square grid is the most recognisable thing about his site, so
  copying it verbatim was the clearest clone signal. Two rounds of
  alternatives were built and rejected: first six grid variants (dots,
  plus-ticks, isometric, log-scale, cross-hatch), then eight computed
  patterns from maths, CS and astronomy (Hilbert curve, Ulam spiral,
  Conway gliders, Truchet tiles, celestial graticule, Keplerian orbits,
  moiré, Fibonacci spacing). None read well behind text at low opacity —
  the ones legible enough to notice were too busy to ignore.

  Landed on **engineering paper**: a fine 8px grid with heavier major
  rules every 40px. Keeps the squared, mathematical feel that was liked
  about his, but two-scale rather than single-scale, which is a
  recognisably different kind of paper. Pure CSS, four gradients, with
  major rules listed first so they paint over the fine ones.

  Worth recording for future decisions: a square grid is not ownable —
  graph paper predates both sites. The real clone risk lives in the
  palette, the typeface, and the section-header format, all matched
  deliberately at the owner's instruction.

- **2026-08-17 — sections renamed, one added.** Six content sections now:

  | Display name | URL | Collection | Was |
  |---|---|---|---|
  | Essays | `/essays/` | `essays` | Blog |
  | Tech Writings | `/tech/` | `tech` | **new** |
  | Projects | `/projects/` | `projects` | unchanged |
  | Paper Drops | `/papers/` | `papers` | Papershelf |
  | Book Drops | `/books/` | `books` | Bookshelf |
  | Talks | `/talks/` | `talks` | unchanged |

  Essays and Tech Writings **share one `writing` schema** — long-form
  thinking versus technical pieces with code — so moving something
  between them is a `git mv`, not a migration. This is the same split
  arnav.tech makes between `essays` and `posts`.

  **Display names and URLs deliberately differ**; the URLs stay short.
  Nothing was deployed when this changed, so no redirects were needed.

  `/rss.xml` is **one combined feed** over both writing collections — a
  subscriber wants everything written, not one of two half-feeds. Each
  item carries its own section prefix so links resolve correctly.

- **2026-08-17 — `canonicalUrl` added to the writing schema.** Needed for
  articles republished from LinkedIn: set it and `<link rel="canonical">`
  points at the original instead of splitting search rank between copies.
  It was in the original design conversation but was lost when this spec
  was written. Verified end to end.

## Purpose

A personal site for Vivesh Yadav, an engineer working on LLM and agent
systems. It is a professional home base and a place to publish: writing,
projects, papers read, books, and talks.

Structurally modelled on [arpitbhayani.me](https://arpitbhayani.me) —
a section per content type, dense and text-first. Visually its own:
same layout language, different palette and typeface.

Content starts empty. Each section ships with one or two placeholder
entries demonstrating the format.

## Non-goals

- No newsletter or email capture.
- No CMS. Content is Markdown in git.
- No courses, payments, or legal/commerce pages.
- No content migration — nothing exists to migrate.

## Reference implementations

| Site | Relevance |
|---|---|
| [championswimmer/arnav.tech](https://github.com/championswimmer/arnav.tech) | Open source, Astro 7. Primary structural reference — content layout, collections, deploy workflow. |
| arpitbhayani.me | Visual and IA reference. Astro 5 on Vercel; **source is private**. Design tokens were extracted from its compiled CSS. |

## Stack

- **Astro 7.2.2**, static output
- **Bun** as package manager and runner (installed 2026-08-16, v1.3.14).
  Chosen over npm during implementation: a cold install is ~10s against
  npm's ~2min, and it matches what arnav.tech uses in CI. `sharp` and the
  font pipeline were verified working under it before the switch was kept.
- Integrations: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`,
  `astro-icon` (+ Iconify sets), `sharp`
- Shiki for code highlighting, emitting CSS variables for both themes
- Fonts self-hosted via Astro's native `fonts` API
- **No UI framework.** No Vue, no React. The theme toggle is vanilla JS.
- **No CSS framework.** Hand-rolled CSS against custom properties.

### Deliberately deferred

Mermaid and KaTeX. Both carry real weight and have no consumer until a
post needs one. `arnav.tech`'s `src/plugins/remark-mermaid.mjs` is a
working reference for adding Mermaid later.

### Rejected alternatives

- **Fork an existing theme (AstroPaper etc.)** — blog-first themes assume
  one content type and fight a six-section structure. Also inherits a
  design system that isn't the chosen one.
- **Bespoke page per section** — six sections that are all "a list of
  dated things" would become six near-duplicate list pages that drift.
- **Bulma** (what arpitbhayani.me uses) — its compiled CSS is 242 KB.
  Hand-rolled tokens reach the same result in roughly 5 KB.

## Content model

Five collections, all using the Content Layer API (`glob()` loader from
`astro/loaders`).

### Shared base schema

Every collection extends one base object rather than repeating fields
(arnav.tech duplicates these seven fields five times; this avoids that):

```
title        string
description  string    optional — see note
pubDate      date
updatedDate  date      optional
(tags removed — see Amendments)
draft        boolean   default false
```

`description` is **required for `blog` and `projects`** (it drives meta
tags and list summaries) and **optional for `papers`, `books`, and
`talks`**, where the Markdown body already serves that purpose. When
absent, meta tags fall back to the first paragraph of the body.

`pubDate` means *when this was published to the site* — for `papers` and
`books`, when you read it; for `talks`, when the talk was given. It is
the sort key for every collection. The separate `year` field on `papers`
and `books` is the work's own publication year, which is a different
thing and is displayed, not sorted on.

### Per-collection fields

| Collection | Directory | Format | Additional fields |
|---|---|---|---|
| `blog` | `src/content/blog/` | md, mdx | `heroImage?` |
| `projects` | `src/content/projects/` | mdx | `stack[]`, `repo?`, `url?`, `status(active\|shipped\|archived)`, `featured` default false, `order` default 0, `heroImage?` |
| `papers` | `src/content/papers/` | md | `authors[]`, `year`, `venue?`, `url` |
| `books` | `src/content/books/` | md | `author`, `rating` 1–5, `year?` |
| `talks` | `src/content/talks/` | md | `venue`, `videoUrl?`, `slidesUrl?` |

Plus one standalone content file, `src/content/about.mdx`, holding the
About page prose. It is not a collection; `src/pages/about.astro` renders
it. This keeps long-form prose out of markup.

### On-disk layout

`blog` and `projects` use **a dated folder per entry with co-located
images** — the pattern arnav.tech uses:

```
src/content/blog/2026-08-16-why-agents-guess-dates/
├── index.mdx
└── images/cover.png
```

**Both shapes are valid in every collection, mixed freely** — this is how
arnav.tech actually does it (29 flat files and 23 folder entries side by
side, with 85 co-located images). A flat `YYYY-MM-DD-slug.md` for a piece
with no assets; a folder with `index.mdx` plus `images/` once it has one.
Both publish to the same clean URL. Promote flat to folder when a piece
gains its first image — no migration, just a move.

`papers`, `books`, and `talks` are flat single `.md` files in practice;
they carry no assets. The Markdown body is the note — why the paper
mattered, what the book was good for.

`heroImage` takes a relative path into the entry's own `images/` folder
and is rendered by `EntryPage` through `astro:assets`, which emits WebP
at several widths with a responsive `srcset` and explicit dimensions.
List pages stay text-only (`date : title`), matching the reference site.

**The date prefix is stripped from the URL.** The folder above publishes
to `/blog/why-agents-guess-dates/`. Files sort chronologically on disk;
URLs stay clean.

### Draft behaviour

`draft: true` excludes an entry from production builds and from RSS, but
it renders in `bun run dev`. This allows writing in the open repo without
publishing.

## Routes

```
/                      home
/about
/blog                  /blog/<slug>
/projects              /projects/<slug>
/papers                /papers/<slug>
/books                 /books/<slug>
/talks                 /talks/<slug>
/rss.xml
/sitemap-index.xml
/404
```

Trailing slashes are used consistently, matching GitHub Pages'
directory-style static output.

**All five collections get both list and detail pages.** Detail pages for
papers, books, and talks will be short. To keep the list pages useful on
their own, **list pages render each entry's note in full inline**; the
detail page is a shareable permalink carrying the metadata block, the
note, and the outbound link.

**No tag pages.** See Amendments.

### Homepage composition

Top to bottom:

1. Hero — name, one-line tagline, 2–3 paragraph bio with inline links
2. Social row — GitHub, LinkedIn, X, sourced from `site.yaml`
3. Recent posts — latest 5, `date : title`, with "Full archive →"
4. Featured projects — 3, filtered on `featured`, ordered by `order`
5. Recent papers — latest 4, with "Papershelf →"
6. Footer — grouped link columns

Blocks 3–5 are the same `TeaserList` component with different props.

## File layout

```
viveshy/
├── astro.config.mjs
├── package.json
├── public/                    favicons, og-image, CNAME, resume.pdf
├── scripts/check-links.mjs
├── .github/workflows/deploy.yml
└── src/
    ├── content.config.ts      all 5 collections, shared base schema
    ├── content/{blog,projects,papers,books,talks}/
    ├── data/site.yaml         name, tagline, nav, socials
    ├── layouts/
    │   ├── BaseLayout.astro   html shell, head, theme script, nav, footer
    │   ├── ListPage.astro     any collection's index
    │   └── EntryPage.astro    any collection's detail page
    ├── components/
    │   ├── BaseHead.astro     meta, OG, canonical, JSON-LD
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── ThemeToggle.astro
    │   ├── SocialLinks.astro
    │   ├── TeaserList.astro   latest N from a collection
    │   ├── EntryRow.astro     one `date : title` line
    │   └── FormattedDate.astro
    ├── pages/
    └── styles/global.css
```

`src/data/site.yaml` is the single source of truth for name, tagline,
nav items, and social links. Adding a social account is one line.

## Visual design

Layout language follows arpitbhayani.me: warm off-white paper rather
than pure white, near-black text rather than true black, hairline
borders instead of cards or shadows, and one accent used sparingly.
Palette and typeface are distinct so the site does not read as a clone.

### Tokens

```css
:root {
  --bg:       #fcfcfa;
  --surface:  #ffffff;
  --ink:      #2b2b2b;
  --ink-soft: #6a6a6a;   /* dates, metadata */
  --border:   #dcdcd8;
  --accent:   #3f6b66;   /* muted sage-teal */
  --measure:  68ch;      /* reading width */
  --width:    960px;     /* nav and list width */
}

[data-theme="dark"] {
  --bg:       #17181a;
  --surface:  #1f2023;
  --ink:      #e4e4e2;
  --ink-soft: #9a9a97;
  --border:   #33353a;
  --accent:   #8fb3ad;
}
```

The accent appears on links, active nav items, and focus rings only.

### Type

- **Inter** for everything, **JetBrains Mono** for code
- 16px base, 1.65 line-height
- Headings 2.0 / 1.5 / 1.25rem — modest on purpose; density is the effect
- Both families self-hosted and subsetted through Astro's `fonts` API,
  with metric-matched fallbacks so there is no layout shift

### Theme switching

`data-theme` on `<html>`, persisted to `localStorage`, applied by an
inline script in `<head>` that runs **before first paint** to avoid a
flash of the wrong theme. Three states: light, dark, system. With no
stored preference, `prefers-color-scheme` decides.

## Deployment

**Repo:** `viveshy/viveshy.github.io` (user site, served at root).

**Remote must use the personal SSH alias:**

```
git@github.com-viveshy:viveshy/viveshy.github.io.git
```

Plain `github.com` resolves to the *work* key (`vivesh-cn`) on this
machine. Verified: `github.com-viveshy` authenticates as `viveshy`.

Git identity is supplied automatically by the existing
`includeIf "gitdir:~/Personal/"` rule in `~/.gitconfig`. Verified after
`git init`: `viveshy / viveshofficial@gmail.com`.

**Pipeline**, on push to `main`:

```
bun install --frozen-lockfile → bun run test → astro check → astro build
      → scripts/check-links.mjs
      → actions/upload-pages-artifact → actions/deploy-pages
```

**Domain:** `viveshy.com`, registrar appears to be Namecheap (confirm at
deploy time). `public/CNAME` contains `viveshy.com`. DNS needs four A
records for the apex pointing at GitHub Pages, plus `www` as a CNAME to
`viveshy.github.io`. **The current IPs must be read from GitHub's
documentation at deploy time, not from memory.** Enable "Enforce HTTPS"
in repo settings once DNS resolves.

## Verification

CI gates, in order:

1. **`astro check`** — type errors and Zod frontmatter violations. A post
   missing `description` fails the build rather than shipping broken.
2. **`astro build`** — catches bad collection references, missing images,
   invalid MDX.
3. **`scripts/check-links.mjs`** — crawls `dist/`, fails on any internal
   href with no corresponding output file. This is the gate that catches
   real breakage as the site grows.

Manual checks before launch: both themes, mobile width, RSS in a reader,
an OG-image preview, and Lighthouse.

## Open items

- **Bio and tagline copy** — needed for the homepage hero. Vivesh to
  supply; placeholder text ships until then.
- **Social handles** — GitHub is `viveshy`; LinkedIn and X handles are
  not yet known.
- **Favicon and OG image** — placeholder until supplied.
- **`resume.pdf`** — optional; slot exists in `public/`.

## Related, out of scope

`~/.gitconfig` contains a classic GitHub PAT in plaintext, in a
`url.insteadOf` rewrite for the *work* account. The rule appears
non-functional (its pattern has a stray leading dot), but the credential
is real and should be revoked and the two lines deleted. SSH already
works for both accounts, so nothing depends on it. Tracked separately;
does not block this project.
