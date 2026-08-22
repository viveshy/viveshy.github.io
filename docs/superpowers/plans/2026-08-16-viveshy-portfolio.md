# viveshy.com Implementation Plan

> **SUPERSEDED — historical record only.**
>
> This describes the site as designed in August 2026. It has since
> changed substantially and is kept for the reasoning, not as a
> description of what exists. Notably gone: tag pages, RSS, the
> Essays/Shorts/Tech Posts split (now one Writing section), Projects and
> Talks. Paper Drops link out to Drive rather than having pages. The
> palette is one accent with no link blue. Read the code, not this.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy viveshy.com — a static Astro site with six sections (home/about, blog, projects, papershelf, bookshelf, talks) published to GitHub Pages under the personal `viveshy` account.

**Architecture:** Five Astro content collections sharing one base Zod schema, rendered through two generic layouts (`ListPage`, `EntryPage`) so every section behaves identically. Pure logic (slug derivation, summaries, tag aggregation, link checking) lives in `src/lib/` and `scripts/` as plain TypeScript/JavaScript with Vitest unit tests. `.astro` templates are verified by `astro check`, a successful build, and a `dist/` link crawl.

**Tech Stack:** Astro 7.2.2 · Bun · TypeScript · Vitest · MDX · Shiki · hand-rolled CSS custom properties. No UI framework, no CSS framework.

**Spec:** `docs/superpowers/specs/2026-08-16-viveshy-portfolio-design.md`

> **Status: executed 2026-08-16/17.** Two post-execution amendments, both
> at the owner's request — see the spec's Amendments section. **Task 7
> (tag pages) was implemented and then removed**; it is retained below as
> a record, not as work to do. The accent tokens in Global Constraints
> below are superseded by `#3f6b66` (light) / `#8fb3ad` (dark), and the
> `tags` field is no longer in the base schema.

## Global Constraints

- **Astro `7.2.2`**, package manager **Bun** (installed 2026-08-16 via `npm i -g bun`; currently 1.3.14). The lockfile is `bun.lock`; there is no `package-lock.json`.
- **No UI framework** — no Vue, no React, no Svelte. The theme toggle is vanilla JS.
- **No CSS framework** — hand-rolled CSS against custom properties, target ~5 KB.
- **Mermaid and KaTeX are deliberately out of scope.** Do not add them.
- Design tokens are fixed. Light: `--bg #fcfcfa` `--surface #ffffff` `--ink #2b2b2b` `--ink-soft #6a6a6a` `--border #dcdcd8` `--accent #0f766e`. Dark: `--bg #17181a` `--surface #1f2023` `--ink #e4e4e2` `--ink-soft #9a9a97` `--border #33353a` `--accent #2dd4bf`. Layout: `--measure 68ch`, `--width 960px`.
- Typefaces: **Inter** (UI and body), **JetBrains Mono** (code). Self-hosted via Astro's `fonts` API. 16px base, 1.65 line-height.
- The accent color appears on links, active nav items, and focus rings **only**.
- Collection directories are exactly: `blog`, `projects`, `papers`, `books`, `talks`.
- `blog` and `projects` use a dated folder per entry (`YYYY-MM-DD-slug/index.mdx`); `papers`, `books`, `talks` are flat `.md` files.
- **The date prefix never appears in a URL.** Always route through `cleanSlug()`.
- All URLs use trailing slashes.
- `draft: true` excludes an entry from production builds and RSS, but renders in `bun run dev`.
- Git identity in this repo is `viveshy / viveshofficial@gmail.com`, supplied automatically by `includeIf "gitdir:~/Personal/"`. Never override it.
- The git remote **must** use the personal SSH alias `git@github.com-viveshy:...`. Plain `github.com` resolves to the work account.
- Site URL is `https://viveshy.com`.

---

### Task 1: Project scaffold and first green build

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/consts.ts`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 6)

**Interfaces:**
- Consumes: nothing.
- Produces: `src/consts.ts` exporting `SITE_TITLE: string`, `SITE_DESCRIPTION: string`, `SITE_AUTHOR: string`, `SITE_URL: string`. A working `bun run build`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "viveshy",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "check:links": "node scripts/check-links.mjs dist"
  },
  "dependencies": {
    "@astrojs/mdx": "^7.0.0",
    "@astrojs/rss": "^4.0.18",
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^7.2.2",
    "astro-icon": "^1.1.5",
    "sharp": "^0.34.3"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@iconify-json/simple-icons": "^1.2.88",
    "@iconify-json/tabler": "^1.2.35",
    "@rollup/plugin-yaml": "^5.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
dist/
node_modules/
.astro/
.DS_Store
npm-debug.log*
.env
.env.production
```

- [ ] **Step 4: Create `src/consts.ts`**

```ts
export const SITE_TITLE = 'Vivesh Yadav';
export const SITE_DESCRIPTION =
  'Engineer working on LLM systems, agents, and retrieval.';
export const SITE_AUTHOR = 'Vivesh Yadav';
export const SITE_URL = 'https://viveshy.com';
```

- [ ] **Step 5: Create `astro.config.mjs`**

```js
// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import yaml from '@rollup/plugin-yaml';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://viveshy.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap(), icon()],

  // Lets us `import site from '../data/site.yaml'`.
  vite: {
    plugins: [yaml()],
  },

  markdown: {
    shikiConfig: {
      // Emit CSS variables for both themes so one build serves light + dark.
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 700],
      styles: ['normal'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
```

- [ ] **Step 6: Create the temporary `src/pages/index.astro`**

```astro
---
import { SITE_TITLE } from '../consts';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{SITE_TITLE}</title>
  </head>
  <body>
    <h1>{SITE_TITLE}</h1>
  </body>
</html>
```

- [ ] **Step 7: Install dependencies**

Run: `bun install`
Expected: completes without `ERESOLVE` errors; `node_modules/` and `package-lock.json` created.

- [ ] **Step 8: Verify the build succeeds**

Run: `bun run build`
Expected: exits 0, prints "Complete!", and `dist/index.html` exists containing `Vivesh Yadav`.

Verify with: `test -f dist/index.html && grep -q 'Vivesh Yadav' dist/index.html && echo OK`

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore astro.config.mjs src/
git commit -m "chore: scaffold Astro 7 project"
```

---

### Task 2: Pure helpers — `cleanSlug` and `summarize` (TDD)

These two functions are used by every collection page, so they get real unit tests before anything renders.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/slug.ts`
- Create: `src/lib/summary.ts`
- Test: `tests/slug.test.ts`
- Test: `tests/summary.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `cleanSlug(id: string): string` — strips a leading `YYYY-MM-DD-` prefix.
  - `summarize(body: string, max?: number): string` — first meaningful paragraph of Markdown, stripped of formatting, truncated to `max` (default 160) characters.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing tests for `cleanSlug`**

Create `tests/slug.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bunx vitest run tests/slug.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lib/slug"`.

- [ ] **Step 4: Implement `src/lib/slug.ts`**

```ts
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/**
 * Content folders are named `YYYY-MM-DD-slug` so they sort chronologically
 * on disk, but that date must never leak into the URL.
 */
export function cleanSlug(id: string): string {
  return id.replace(DATE_PREFIX, '');
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bunx vitest run tests/slug.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Write the failing tests for `summarize`**

Create `tests/summary.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { summarize } from '../src/lib/summary';

describe('summarize', () => {
  it('returns the first paragraph', () => {
    const body = 'First paragraph here.\n\nSecond paragraph here.';
    expect(summarize(body)).toBe('First paragraph here.');
  });

  it('skips leading headings and blank lines', () => {
    const body = '# A Heading\n\nThe real opening line.';
    expect(summarize(body)).toBe('The real opening line.');
  });

  it('strips bold, italic, code, and link markup', () => {
    const body = 'A **bold** and _soft_ `code` [link](https://x.com) here.';
    expect(summarize(body)).toBe('A bold and soft code link here.');
  });

  it('truncates to the max length on a word boundary with an ellipsis', () => {
    const body = 'word '.repeat(60);
    const result = summarize(body, 40);
    expect(result.length).toBeLessThanOrEqual(41);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toContain('wor…');
  });

  it('returns an empty string for an empty body', () => {
    expect(summarize('')).toBe('');
  });
});
```

- [ ] **Step 7: Run the tests to verify they fail**

Run: `bunx vitest run tests/summary.test.ts`
Expected: FAIL — cannot resolve `../src/lib/summary`.

- [ ] **Step 8: Implement `src/lib/summary.ts`**

```ts
/**
 * Derives a meta-description from Markdown body text. Used when an entry
 * omits `description` — papers, books, and talks carry their note in the
 * body rather than in frontmatter.
 */
export function summarize(body: string, max = 160): string {
  const paragraph = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !block.startsWith('#'));

  if (!paragraph) return '';

  const plain = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[*_`]/g, '') // emphasis and code ticks
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= max) return plain;

  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
```

- [ ] **Step 9: Run the full test suite**

Run: `bun run test`
Expected: PASS, 9 tests across 2 files.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts src/lib/ tests/ package.json
git commit -m "feat: add cleanSlug and summarize helpers with tests"
```

---

### Task 3: Content collections, schemas, and seed content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/about.mdx`
- Create: `src/content/blog/2026-08-16-hello/index.mdx`
- Create: `src/content/projects/2026-08-16-viveshy-com/index.mdx`
- Create: `src/content/papers/lost-in-the-middle.md`
- Create: `src/content/books/designing-data-intensive-applications.md`
- Create: `src/content/talks/agents-in-production.md`

**Interfaces:**
- Consumes: nothing.
- Produces: five collections named `blog`, `projects`, `papers`, `books`, `talks`, queryable via `getCollection()`. Every entry's `data` includes `title`, `pubDate: Date`, `tags: string[]`, `draft: boolean`, and an optional `description`.

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Shared by every collection. `description` is optional here and made
 * required on blog + projects below; papers, books, and talks carry their
 * note in the Markdown body instead.
 *
 * `pubDate` means "when this was published to the site" — for papers and
 * books, when it was read; for talks, when the talk was given. It is the
 * sort key everywhere.
 */
const base = {
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      ...base,
      description: z.string(),
      heroImage: image().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      ...base,
      description: z.string(),
      heroImage: image().optional(),
      stack: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      url: z.string().url().optional(),
      status: z.enum(['active', 'shipped', 'archived']).default('active'),
      featured: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

const papers = defineCollection({
  loader: glob({ base: './src/content/papers', pattern: '**/*.md' }),
  schema: z.object({
    ...base,
    authors: z.array(z.string()).default([]),
    // The paper's own publication year — displayed, never sorted on.
    year: z.number(),
    venue: z.string().optional(),
    url: z.string().url(),
  }),
});

const books = defineCollection({
  loader: glob({ base: './src/content/books', pattern: '**/*.md' }),
  schema: z.object({
    ...base,
    author: z.string(),
    rating: z.number().int().min(1).max(5),
    year: z.number().optional(),
  }),
});

const talks = defineCollection({
  loader: glob({ base: './src/content/talks', pattern: '**/*.md' }),
  schema: z.object({
    ...base,
    venue: z.string(),
    videoUrl: z.string().url().optional(),
    slidesUrl: z.string().url().optional(),
  }),
});

export const collections = { blog, projects, papers, books, talks };
```

- [ ] **Step 2: Create `src/content/about.mdx`**

```mdx
---
title: About
description: Vivesh Yadav — engineer working on LLM systems, agents, and retrieval.
---

I am an engineer working on LLM systems, agents, and retrieval.

*Replace this with your own bio. This file holds the prose for `/about`
so it stays out of the markup.*
```

- [ ] **Step 3: Create the seed blog post**

`src/content/blog/2026-08-16-hello/index.mdx`:

```mdx
---
title: Hello
description: The first post — what this site is for and what will land here.
pubDate: 2026-08-16
tags: ['meta']
---

This is a placeholder post. It exists so the blog list, the entry page,
the RSS feed, and the homepage teaser all have something real to render.

Replace it with your first real post, or delete it once you have one.
```

- [ ] **Step 4: Create the seed project**

`src/content/projects/2026-08-16-viveshy-com/index.mdx`:

```mdx
---
title: viveshy.com
description: This website — a static Astro site with five content collections.
pubDate: 2026-08-16
tags: ['astro', 'web']
stack: ['Astro', 'TypeScript', 'GitHub Pages']
repo: https://github.com/viveshy/viveshy.github.io
url: https://viveshy.com
status: active
featured: true
order: 1
---

## The problem

I wanted a single URL that holds my writing, projects, papers, books,
and talks — without a CMS, a database, or a monthly bill.

## The approach

Five Astro content collections sharing one base schema, rendered through
two generic layouts. Content is Markdown in git. The whole site is static
and deploys to GitHub Pages on push.

## Tradeoffs

Every content change triggers a full rebuild and redeploy. At this scale
that costs about a minute of CI and buys a site with no server to run.
```

- [ ] **Step 5: Create the seed paper**

`src/content/papers/lost-in-the-middle.md`:

```md
---
title: 'Lost in the Middle: How Language Models Use Long Contexts'
pubDate: 2026-08-16
authors: ['Nelson F. Liu', 'Kevin Lin', 'John Hewitt']
year: 2023
venue: TACL
url: https://arxiv.org/abs/2307.03172
tags: ['llm', 'retrieval']
---

Performance is highest when the relevant information sits at the very
beginning or very end of the context window, and degrades measurably when
it is buried in the middle.

The practical consequence for RAG: retrieval ranking matters more than
retrieval recall past a certain context length.
```

- [ ] **Step 6: Create the seed book**

`src/content/books/designing-data-intensive-applications.md`:

```md
---
title: Designing Data-Intensive Applications
pubDate: 2026-08-16
author: Martin Kleppmann
rating: 5
year: 2017
tags: ['systems', 'databases']
---

The book that makes distributed systems tradeoffs legible rather than
mystical. The chapters on replication and consistency are worth rereading
every couple of years.
```

- [ ] **Step 7: Create the seed talk**

`src/content/talks/agents-in-production.md`:

```md
---
title: Agents in Production
pubDate: 2026-08-16
venue: Placeholder Meetup
tags: ['agents', 'llm']
---

A placeholder talk entry so the talks list and entry page have something
to render. Replace or delete once you have a real talk to list.
```

- [ ] **Step 8: Verify schemas typecheck and the build succeeds**

Run: `bun run check`
Expected: `0 errors`. Astro generates collection types into `.astro/`.

Run: `bun run build`
Expected: exits 0.

- [ ] **Step 9: Verify schema enforcement actually works**

Temporarily add `rating: 9` to the book's frontmatter, then run `bun run build`.
Expected: FAIL with a Zod error naming `rating`.
Revert the change to `rating: 5` and confirm `bun run build` passes again.

This confirms bad frontmatter fails the build instead of shipping.

- [ ] **Step 10: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: define five content collections with seed entries"
```

---

### Task 4: Design tokens and the page shell

**Files:**
- Create: `src/styles/global.css`
- Create: `src/data/site.yaml`
- Create: `src/components/BaseHead.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/SocialLinks.astro`
- Create: `src/components/FormattedDate.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` (use the new layout)

**Interfaces:**
- Consumes: `SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_AUTHOR`, `SITE_URL` from `src/consts.ts`.
- Produces:
  - `BaseLayout` props: `{ title?: string; description?: string; wide?: boolean; type?: 'website' | 'article' }`.
  - `FormattedDate` props: `{ date: Date }`.
  - `src/data/site.yaml` shape: `{ nav: { label, href }[], socials: { platform, label, href, icon }[] }`.

- [ ] **Step 1: Create `src/data/site.yaml`**

```yaml
nav:
  - { label: Blog, href: /blog/ }
  - { label: Projects, href: /projects/ }
  - { label: Papers, href: /papers/ }
  - { label: Books, href: /books/ }
  - { label: Talks, href: /talks/ }
  - { label: About, href: /about/ }

socials:
  - platform: github
    label: GitHub
    href: https://github.com/viveshy
    icon: simple-icons:github
  - platform: linkedin
    label: LinkedIn
    href: https://www.linkedin.com/in/viveshy
    icon: simple-icons:linkedin
  - platform: x
    label: X
    href: https://x.com/viveshy
    icon: simple-icons:x
```

Note: the LinkedIn and X URLs are placeholders pending real handles (tracked in the spec's Open Items). They must still be valid URLs so the build passes.

- [ ] **Step 2: Create `src/styles/global.css`**

```css
:root {
  --bg: #fcfcfa;
  --surface: #ffffff;
  --ink: #2b2b2b;
  --ink-soft: #6a6a6a;
  --border: #dcdcd8;
  --accent: #0f766e;
  --measure: 68ch;
  --width: 960px;
}

:root[data-theme='dark'] {
  --bg: #17181a;
  --surface: #1f2023;
  --ink: #e4e4e2;
  --ink-soft: #9a9a97;
  --border: #33353a;
  --accent: #2dd4bf;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg: #17181a;
    --surface: #1f2023;
    --ink: #e4e4e2;
    --ink-soft: #9a9a97;
    --border: #33353a;
    --accent: #2dd4bf;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

main {
  width: min(100% - 2.5rem, var(--measure));
  margin: 0 auto;
  padding: 2.5rem 0 4rem;
}

main.wide {
  width: min(100% - 2.5rem, var(--width));
}

h1,
h2,
h3 {
  line-height: 1.25;
  font-weight: 600;
  margin: 2rem 0 0.75rem;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

code,
pre {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

pre {
  padding: 1rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}

hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 2.5rem 0;
}

img {
  max-width: 100%;
  height: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 0.5rem 0.75rem 0.5rem 0;
  text-align: left;
}

/* Shiki emits --shiki-light / --shiki-dark; pick per theme. */
code[data-theme],
code[data-theme] span {
  color: var(--shiki-light);
}

:root[data-theme='dark'] code[data-theme],
:root[data-theme='dark'] code[data-theme] span {
  color: var(--shiki-dark);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) code[data-theme],
  :root:not([data-theme='light']) code[data-theme] span {
    color: var(--shiki-dark);
  }
}
```

- [ ] **Step 3: Create `src/components/BaseHead.astro`**

```astro
---
import '../styles/global.css';
import { Font } from 'astro:assets';
import { SITE_TITLE, SITE_AUTHOR } from '../consts';

interface Props {
  title: string;
  description: string;
  type?: 'website' | 'article';
  pubDate?: Date;
}

const { title, description, type = 'website', pubDate } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL('/og-default.png', Astro.site);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />

{/* Set the theme before first paint so there is no flash. */}
<script is:inline>
  (function () {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  })();
</script>

<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="sitemap" href="/sitemap-index.xml" />
<link
  rel="alternate"
  type="application/rss+xml"
  title={SITE_TITLE}
  href={new URL('rss.xml', Astro.site)}
/>
<meta name="generator" content={Astro.generator} />

<Font cssVariable="--font-sans" preload />
<Font cssVariable="--font-mono" />

<link rel="canonical" href={canonicalURL} />
<title>{title}</title>
<meta name="description" content={description} />
<meta name="author" content={SITE_AUTHOR} />

<meta property="og:type" content={type} />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:site_name" content={SITE_TITLE} />
<meta property="og:image" content={ogImage} />
{pubDate && (
  <meta property="article:published_time" content={pubDate.toISOString()} />
)}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
```

- [ ] **Step 4: Create `src/components/ThemeToggle.astro`**

```astro
---
// Three states: light / dark / system. "system" clears the override.
---

<div class="theme-toggle" role="group" aria-label="Color theme">
  <button type="button" data-mode="light">Light</button>
  <button type="button" data-mode="system">System</button>
  <button type="button" data-mode="dark">Dark</button>
</div>

<script>
  const KEY = 'theme';
  const root = document.documentElement;
  const group = document.querySelector('.theme-toggle');

  function apply(mode: string) {
    if (mode === 'system') {
      root.removeAttribute('data-theme');
      localStorage.removeItem(KEY);
    } else {
      root.setAttribute('data-theme', mode);
      localStorage.setItem(KEY, mode);
    }
    group?.setAttribute('data-active', mode);
  }

  group?.setAttribute('data-active', localStorage.getItem(KEY) ?? 'system');
  group?.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => apply(btn.dataset.mode ?? 'system'));
  });
</script>

<style>
  .theme-toggle {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 999px;
    overflow: hidden;
  }
  .theme-toggle button {
    font: inherit;
    font-size: 0.75rem;
    padding: 0.15em 0.6em;
    border: 0;
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
  }
  .theme-toggle button:hover {
    color: var(--ink);
  }
  .theme-toggle[data-active='light'] button[data-mode='light'],
  .theme-toggle[data-active='dark'] button[data-mode='dark'],
  .theme-toggle[data-active='system'] button[data-mode='system'] {
    color: var(--accent);
    font-weight: 600;
  }
</style>
```

- [ ] **Step 5: Create `src/components/SocialLinks.astro`**

```astro
---
import { Icon } from 'astro-icon/components';
import site from '../data/site.yaml';

interface Social {
  platform: string;
  label: string;
  href: string;
  icon: string;
}

const socials: Social[] = site.socials;
---

<ul class="socials">
  {socials.map((s) => (
    <li>
      <a href={s.href} rel="me noopener" target="_blank">
        <Icon name={s.icon} />
        <span>{s.label}</span>
      </a>
    </li>
  ))}
</ul>

<style>
  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    list-style: none;
    padding: 0;
    margin: 1.25rem 0;
  }
  .socials a {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-size: 0.9rem;
  }
  .socials [data-icon] {
    width: 1.05em;
    height: 1.05em;
  }
</style>
```

- [ ] **Step 6: Create `src/components/Nav.astro`**

```astro
---
import site from '../data/site.yaml';
import ThemeToggle from './ThemeToggle.astro';
import { SITE_TITLE } from '../consts';

interface NavItem {
  label: string;
  href: string;
}

const nav: NavItem[] = site.nav;
const path = Astro.url.pathname;
---

<header>
  <div class="bar">
    <a class="brand" href="/">{SITE_TITLE}</a>
    <nav>
      {nav.map((item) => (
        <a
          href={item.href}
          class={path.startsWith(item.href) ? 'active' : ''}
          aria-current={path.startsWith(item.href) ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
    <ThemeToggle />
  </div>
</header>

<style>
  header {
    border-bottom: 1px solid var(--border);
  }
  .bar {
    width: min(100% - 2.5rem, var(--width));
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding: 1rem 0;
  }
  .brand {
    font-weight: 600;
    color: var(--ink);
  }
  nav {
    display: flex;
    gap: 1rem;
    margin-right: auto;
    flex-wrap: wrap;
  }
  nav a {
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
  nav a:hover,
  nav a.active {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 7: Create `src/components/Footer.astro`**

```astro
---
import SocialLinks from './SocialLinks.astro';
import { SITE_AUTHOR } from '../consts';

const year = new Date().getFullYear();
---

<footer>
  <div class="inner">
    <SocialLinks />
    <p>© {SITE_AUTHOR}, {year}</p>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border);
    margin-top: 4rem;
  }
  .inner {
    width: min(100% - 2.5rem, var(--width));
    margin: 0 auto;
    padding: 1.5rem 0 3rem;
  }
  p {
    color: var(--ink-soft);
    font-size: 0.85rem;
    margin: 0;
  }
</style>
```

- [ ] **Step 8: Create `src/components/FormattedDate.astro`**

```astro
---
interface Props {
  date: Date;
}

const { date } = Astro.props;
---

<time datetime={date.toISOString()}>
  {
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }
</time>
```

Note the explicit `timeZone: 'UTC'`. Without it, a `pubDate` of `2026-08-16` renders as Aug 15 for anyone building or browsing west of UTC.

- [ ] **Step 9: Create `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

interface Props {
  title?: string;
  description?: string;
  wide?: boolean;
  type?: 'website' | 'article';
  pubDate?: Date;
}

const {
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  wide = false,
  type,
  pubDate,
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead
      title={title}
      description={description}
      type={type}
      pubDate={pubDate}
    />
  </head>
  <body>
    <Nav />
    <main class={wide ? 'wide' : ''}>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 10: Replace `src/pages/index.astro` to use the shell**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout wide>
  <h1>Vivesh Yadav</h1>
  <p>Homepage content lands here in Task 6.</p>
</BaseLayout>
```

- [ ] **Step 11: Verify**

Run: `bun run check` — expected `0 errors`.
Run: `bun run build` — expected exit 0.
Run: `bun run preview`, open the site, and confirm: nav renders, the theme toggle switches all three ways and survives a reload, and there is no white flash on load in dark mode.

- [ ] **Step 12: Commit**

```bash
git add src/styles/ src/data/ src/components/ src/layouts/ src/pages/index.astro
git commit -m "feat: design tokens, page shell, and theme toggle"
```

---

### Task 5: Generic list and entry pages for all five collections

**Files:**
- Create: `src/lib/entries.ts`
- Test: `tests/entries.test.ts`
- Create: `src/components/EntryRow.astro`
- Create: `src/layouts/ListPage.astro`
- Create: `src/layouts/EntryPage.astro`
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`
- Create: `src/pages/papers/index.astro`, `src/pages/papers/[...slug].astro`
- Create: `src/pages/books/index.astro`, `src/pages/books/[...slug].astro`
- Create: `src/pages/talks/index.astro`, `src/pages/talks/[...slug].astro`

**Interfaces:**
- Consumes: `cleanSlug` from `src/lib/slug.ts`, `summarize` from `src/lib/summary.ts`, `BaseLayout`, `FormattedDate`.
- Produces:
  - `byNewest<T extends { data: { pubDate: Date } }>(entries: T[]): T[]`
  - `isPublished<T extends { data: { draft: boolean } }>(entry: T): boolean`
  - `ListPage` props: `{ title: string; blurb: string; base: string; entries: CollectionEntry<any>[] }`
  - `EntryPage` props: `{ title: string; description?: string; pubDate: Date; updatedDate?: Date; tags: string[] }` plus a default slot.

- [ ] **Step 1: Write the failing tests for the entry helpers**

Create `tests/entries.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bunx vitest run tests/entries.test.ts`
Expected: FAIL — cannot resolve `../src/lib/entries`.

- [ ] **Step 3: Implement `src/lib/entries.ts`**

```ts
type Dated = { data: { pubDate: Date } };
type Draftable = { data: { draft: boolean } };

/** Newest first. Returns a new array; does not mutate the input. */
export function byNewest<T extends Dated>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * Drafts are hidden in production builds but visible in `astro dev`,
 * so work in progress can live in the repo without shipping.
 *
 * `isProd` is injected rather than read inline so the behaviour is
 * testable without depending on the ambient build environment.
 */
export function isPublished<T extends Draftable>(
  entry: T,
  isProd: boolean = import.meta.env.PROD,
): boolean {
  return isProd ? !entry.data.draft : true;
}
```

**Call it as `.filter((e) => isPublished(e))`, never `.filter((e) => isPublished(e))`.**
`Array.prototype.filter` passes the element *index* as the second argument,
which would land in `isProd` and silently flip the draft rule on for every
entry after the first.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bunx vitest run tests/entries.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create `src/components/EntryRow.astro`**

```astro
---
import FormattedDate from './FormattedDate.astro';

interface Props {
  href: string;
  title: string;
  date: Date;
  note?: string;
}

const { href, title, date, note } = Astro.props;

// Note-carrying collections pass their rendered body through the slot
// instead of the `note` string.
const hasSlottedNote = Astro.slots.has('default');
---

<li class="row">
  <p class="line">
    <FormattedDate date={date} />
    <span class="sep">:</span>
    <a href={href}>{title}</a>
  </p>
  {note && <p class="note">{note}</p>}
  {hasSlottedNote && (
    <div class="note">
      <slot />
    </div>
  )}
</li>

<style>
  .row {
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--border);
  }
  .line {
    margin: 0;
    display: flex;
    gap: 0.5em;
    flex-wrap: wrap;
  }
  .line time,
  .sep {
    color: var(--ink-soft);
    font-size: 0.9rem;
    white-space: nowrap;
  }
  .note {
    margin: 0.25rem 0 0;
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
</style>
```

- [ ] **Step 6: Create `src/layouts/ListPage.astro`**

```astro
---
import { render } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import EntryRow from '../components/EntryRow.astro';
import { cleanSlug } from '../lib/slug';
import { byNewest } from '../lib/entries';

interface Props {
  title: string;
  blurb: string;
  /** URL prefix, e.g. "/blog". */
  base: string;
  entries: any[];
  /** Render each entry's full note inline (papers, books, talks). */
  showNotes?: boolean;
}

const { title, blurb, base, entries, showNotes = false } = Astro.props;
const sorted = byNewest(entries);

// Note-carrying collections show the note in full on the list page, so
// the list stays useful on its own. Render the body rather than
// truncating it — a two-sentence note summarized is just the note.
const rows = await Promise.all(
  sorted.map(async (entry) => ({
    entry,
    Note: showNotes ? (await render(entry)).Content : null,
  })),
);
---

<BaseLayout title={`${title} · Vivesh Yadav`} description={blurb} wide>
  <h1>{title}</h1>
  <p class="blurb">{blurb}</p>

  {rows.length === 0 && <p class="blurb">Nothing here yet.</p>}

  <ul class="list">
    {rows.map(({ entry, Note }) => (
      <EntryRow
        href={`${base}/${cleanSlug(entry.id)}/`}
        title={entry.data.title}
        date={entry.data.pubDate}
        note={showNotes ? undefined : entry.data.description}
      >
        {Note && <Note />}
      </EntryRow>
    ))}
  </ul>
</BaseLayout>

<style>
  .blurb {
    color: var(--ink-soft);
    margin-bottom: 2rem;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid var(--border);
  }
</style>
```

- [ ] **Step 7: Create `src/layouts/EntryPage.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import FormattedDate from '../components/FormattedDate.astro';

interface Props {
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  tags?: string[];
}

const { title, description, pubDate, updatedDate, tags = [] } = Astro.props;
---

<BaseLayout
  title={`${title} · Vivesh Yadav`}
  description={description ?? title}
  type="article"
  pubDate={pubDate}
>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">
        <FormattedDate date={pubDate} />
        {updatedDate && (
          <span> · updated <FormattedDate date={updatedDate} /></span>
        )}
      </p>
      {tags.length > 0 && (
        <p class="tags">
          {tags.map((tag) => (
            <a href={`/tags/${tag}/`}>#{tag}</a>
          ))}
        </p>
      )}
    </header>

    <slot name="meta" />
    <slot />
  </article>
</BaseLayout>

<style>
  h1 {
    margin-top: 0;
  }
  .meta,
  .tags {
    color: var(--ink-soft);
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }
  .tags {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  article :global(h2) {
    margin-top: 2.5rem;
  }
</style>
```

- [ ] **Step 8: Create the blog pages**

`src/pages/blog/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ListPage from '../../layouts/ListPage.astro';
import { isPublished } from '../../lib/entries';

const entries = (await getCollection('blog')).filter((e) => isPublished(e));
---

<ListPage
  title="Blog"
  blurb="Notes on LLM systems, agents, and retrieval."
  base="/blog"
  entries={entries}
/>
```

`src/pages/blog/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import EntryPage from '../../layouts/EntryPage.astro';
import { cleanSlug } from '../../lib/slug';
import { isPublished } from '../../lib/entries';

export async function getStaticPaths() {
  const entries = (await getCollection('blog')).filter((e) => isPublished(e));
  return entries.map((entry) => ({
    params: { slug: cleanSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---

<EntryPage {...entry.data}>
  <Content />
</EntryPage>
```

- [ ] **Step 9: Create the projects pages**

`src/pages/projects/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ListPage from '../../layouts/ListPage.astro';
import { isPublished } from '../../lib/entries';

const entries = (await getCollection('projects')).filter((e) => isPublished(e));
---

<ListPage
  title="Projects"
  blurb="Things I have built, and what I learned building them."
  base="/projects"
  entries={entries}
/>
```

`src/pages/projects/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import EntryPage from '../../layouts/EntryPage.astro';
import { cleanSlug } from '../../lib/slug';
import { isPublished } from '../../lib/entries';

export async function getStaticPaths() {
  const entries = (await getCollection('projects')).filter((e) => isPublished(e));
  return entries.map((entry) => ({
    params: { slug: cleanSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { stack, repo, url, status } = entry.data;
---

<EntryPage {...entry.data}>
  <div slot="meta" class="project-meta">
    <p class="status">{status}</p>
    {stack.length > 0 && (
      <ul class="stack">
        {stack.map((s: string) => <li>{s}</li>)}
      </ul>
    )}
    <p class="links">
      {repo && <a href={repo}>Source</a>}
      {url && <a href={url}>Visit</a>}
    </p>
  </div>
  <Content />
</EntryPage>

<style>
  .project-meta {
    margin-bottom: 2rem;
  }
  .status {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.7rem;
    color: var(--ink-soft);
    margin: 0;
  }
  .stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0.75rem 0;
  }
  .stack li {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.15em 0.6em;
    color: var(--ink-soft);
  }
  .links {
    display: flex;
    gap: 1rem;
    margin: 0;
  }
</style>
```

- [ ] **Step 10: Create the papers pages**

`src/pages/papers/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ListPage from '../../layouts/ListPage.astro';
import { isPublished } from '../../lib/entries';

const entries = (await getCollection('papers')).filter((e) => isPublished(e));
---

<ListPage
  title="Papershelf"
  blurb="Papers I have read, and why they mattered."
  base="/papers"
  entries={entries}
  showNotes
/>
```

`src/pages/papers/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import EntryPage from '../../layouts/EntryPage.astro';
import { cleanSlug } from '../../lib/slug';
import { isPublished } from '../../lib/entries';

export async function getStaticPaths() {
  const entries = (await getCollection('papers')).filter((e) => isPublished(e));
  return entries.map((entry) => ({
    params: { slug: cleanSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { authors, year, venue, url } = entry.data;
---

<EntryPage {...entry.data}>
  <dl slot="meta" class="paper-meta">
    <dt>Authors</dt>
    <dd>{authors.join(', ')}</dd>
    <dt>Published</dt>
    <dd>{venue ? `${venue}, ${year}` : year}</dd>
    <dt>Link</dt>
    <dd><a href={url}>{url}</a></dd>
  </dl>
  <Content />
</EntryPage>

<style>
  .paper-meta {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.35rem 1.25rem;
    font-size: 0.9rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 2rem;
  }
  dt {
    color: var(--ink-soft);
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
</style>
```

- [ ] **Step 11: Create the books pages**

`src/pages/books/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ListPage from '../../layouts/ListPage.astro';
import { isPublished } from '../../lib/entries';

const entries = (await getCollection('books')).filter((e) => isPublished(e));
---

<ListPage
  title="Bookshelf"
  blurb="Books worth the time, and what I took from them."
  base="/books"
  entries={entries}
  showNotes
/>
```

`src/pages/books/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import EntryPage from '../../layouts/EntryPage.astro';
import { cleanSlug } from '../../lib/slug';
import { isPublished } from '../../lib/entries';

export async function getStaticPaths() {
  const entries = (await getCollection('books')).filter((e) => isPublished(e));
  return entries.map((entry) => ({
    params: { slug: cleanSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { author, rating, year } = entry.data;
---

<EntryPage {...entry.data}>
  <p slot="meta" class="book-meta">
    {author}{year ? `, ${year}` : ''} · {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </p>
  <Content />
</EntryPage>

<style>
  .book-meta {
    color: var(--ink-soft);
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
</style>
```

- [ ] **Step 12: Create the talks pages**

`src/pages/talks/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ListPage from '../../layouts/ListPage.astro';
import { isPublished } from '../../lib/entries';

const entries = (await getCollection('talks')).filter((e) => isPublished(e));
---

<ListPage
  title="Talks"
  blurb="Talks I have given."
  base="/talks"
  entries={entries}
  showNotes
/>
```

`src/pages/talks/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import EntryPage from '../../layouts/EntryPage.astro';
import { cleanSlug } from '../../lib/slug';
import { isPublished } from '../../lib/entries';

export async function getStaticPaths() {
  const entries = (await getCollection('talks')).filter((e) => isPublished(e));
  return entries.map((entry) => ({
    params: { slug: cleanSlug(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { venue, videoUrl, slidesUrl } = entry.data;
---

<EntryPage {...entry.data}>
  <p slot="meta" class="talk-meta">
    {venue}
    {videoUrl && <> · <a href={videoUrl}>Video</a></>}
    {slidesUrl && <> · <a href={slidesUrl}>Slides</a></>}
  </p>
  <Content />
</EntryPage>

<style>
  .talk-meta {
    color: var(--ink-soft);
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
</style>
```

- [ ] **Step 13: Verify all ten routes build**

Run: `bun run test` — expected PASS.
Run: `bun run check` — expected `0 errors`.
Run: `bun run build` — expected exit 0.

Verify every route emitted, and that no date prefix leaked into a URL:

```bash
find dist -name index.html | sort
test -f dist/blog/hello/index.html && echo "slug OK"
test ! -d dist/blog/2026-08-16-hello && echo "no date prefix OK"
```

Expected: `dist/blog/hello/index.html` exists; `dist/blog/2026-08-16-hello/` does not.

- [ ] **Step 14: Commit**

```bash
git add src/lib/entries.ts tests/entries.test.ts src/components/EntryRow.astro src/layouts/ src/pages/
git commit -m "feat: generic list and entry pages for all five collections"
```

---

### Task 6: Homepage, About page, and teasers

**Files:**
- Create: `src/components/TeaserList.astro`
- Modify: `src/pages/index.astro` (replace the Task 4 placeholder)
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `byNewest`, `isPublished`, `cleanSlug`, `EntryRow`, `SocialLinks`, `BaseLayout`.
- Produces: `TeaserList` props `{ heading: string; more: string; moreLabel: string; base: string; entries: any[]; limit: number }`.

- [ ] **Step 1: Create `src/components/TeaserList.astro`**

```astro
---
import EntryRow from './EntryRow.astro';
import { byNewest } from '../lib/entries';
import { cleanSlug } from '../lib/slug';

interface Props {
  heading: string;
  more: string;
  moreLabel: string;
  base: string;
  entries: any[];
  limit?: number;
}

const { heading, more, moreLabel, base, entries, limit = 5 } = Astro.props;
const shown = byNewest(entries).slice(0, limit);
---

<section>
  <div class="head">
    <h2>{heading}</h2>
    <a href={more}>{moreLabel} →</a>
  </div>
  <ul>
    {shown.map((entry) => (
      <EntryRow
        href={`${base}/${cleanSlug(entry.id)}/`}
        title={entry.data.title}
        date={entry.data.pubDate}
      />
    ))}
  </ul>
</section>

<style>
  section {
    margin-top: 3rem;
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.4rem;
  }
  h2 {
    margin: 0;
    font-size: 1.15rem;
  }
  .head a {
    font-size: 0.85rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Replace `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SocialLinks from '../components/SocialLinks.astro';
import TeaserList from '../components/TeaserList.astro';
import { byNewest, isPublished } from '../lib/entries';

const blog = (await getCollection('blog')).filter((e) => isPublished(e));
const papers = (await getCollection('papers')).filter((e) => isPublished(e));
const projects = byNewest(
  (await getCollection('projects'))
    .filter((e) => isPublished(e))
    .filter((p) => p.data.featured),
).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout wide>
  <section class="hero">
    <h1>Hey, I am Vivesh</h1>
    <p class="tagline">LLM systems, agents, and retrieval.</p>

    <p>
      I am an engineer working at the intersection of language models and
      production systems — building the harness that keeps agents reliable
      once they leave a notebook.
    </p>
    <p>
      <em>Replace this bio with your own. It lives in
      <code>src/pages/index.astro</code>.</em>
    </p>

    <SocialLinks />
  </section>

  <TeaserList
    heading="Recent posts"
    more="/blog/"
    moreLabel="Full archive"
    base="/blog"
    entries={blog}
    limit={5}
  />

  <TeaserList
    heading="Featured projects"
    more="/projects/"
    moreLabel="All projects"
    base="/projects"
    entries={projects}
    limit={3}
  />

  <TeaserList
    heading="Recent papers"
    more="/papers/"
    moreLabel="Papershelf"
    base="/papers"
    entries={papers}
    limit={4}
  />
</BaseLayout>

<style>
  .hero h1 {
    margin-top: 0;
  }
  .tagline {
    color: var(--ink-soft);
    font-size: 1.15rem;
    margin-top: -0.5rem;
  }
</style>
```

- [ ] **Step 3: Create `src/pages/about.astro`**

`about.mdx` is deliberately **not** a collection — it is a single page, so
it is imported directly. `getEntry()` would not resolve it, since nothing
in `content.config.ts` loads it.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { Content, frontmatter } from '../content/about.mdx';
---

<BaseLayout title={`${frontmatter.title} · Vivesh Yadav`} description={frontmatter.description}>
  <h1>{frontmatter.title}</h1>
  <Content />
</BaseLayout>
```

- [ ] **Step 4: Verify**

Run: `bun run check` — expected `0 errors`.
Run: `bun run build` — expected exit 0.

```bash
grep -q 'Hey, I am Vivesh' dist/index.html && echo "hero OK"
grep -q 'Recent posts' dist/index.html && echo "teasers OK"
test -f dist/about/index.html && echo "about OK"
```

- [ ] **Step 5: Commit**

```bash
git add src/components/TeaserList.astro src/pages/index.astro src/pages/about.astro
git commit -m "feat: homepage with teasers, and about page"
```

---

### Task 7: Cross-collection tag pages

**Files:**
- Create: `src/lib/tags.ts`
- Test: `tests/tags.test.ts`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`

**Interfaces:**
- Consumes: `byNewest`, `isPublished`, `cleanSlug`.
- Produces:
  - `type Tagged = { id: string; collection: string; data: { title: string; pubDate: Date; tags: string[] } }`
  - `collectTags(entries: Tagged[]): { tag: string; count: number }[]` — alphabetical, deduplicated.
  - `entriesForTag(entries: Tagged[], tag: string): Tagged[]`

- [ ] **Step 1: Write the failing tests**

Create `tests/tags.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { collectTags, entriesForTag } from '../src/lib/tags';

const e = (id: string, tags: string[], iso = '2026-01-01') => ({
  id,
  collection: 'blog',
  data: { title: id, pubDate: new Date(iso), tags },
});

describe('collectTags', () => {
  it('deduplicates across entries and counts occurrences', () => {
    const result = collectTags([
      e('a', ['agents', 'llm']),
      e('b', ['llm']),
      e('c', []),
    ]);
    expect(result).toEqual([
      { tag: 'agents', count: 1 },
      { tag: 'llm', count: 2 },
    ]);
  });

  it('sorts alphabetically', () => {
    const result = collectTags([e('a', ['zebra', 'alpha', 'mango'])]);
    expect(result.map((t) => t.tag)).toEqual(['alpha', 'mango', 'zebra']);
  });

  it('returns an empty array when nothing is tagged', () => {
    expect(collectTags([e('a', [])])).toEqual([]);
  });
});

describe('entriesForTag', () => {
  it('returns only entries carrying the tag', () => {
    const entries = [e('a', ['llm']), e('b', ['agents']), e('c', ['llm'])];
    expect(entriesForTag(entries, 'llm').map((x) => x.id)).toEqual(['a', 'c']);
  });

  it('returns an empty array for an unknown tag', () => {
    expect(entriesForTag([e('a', ['llm'])], 'nope')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bunx vitest run tests/tags.test.ts`
Expected: FAIL — cannot resolve `../src/lib/tags`.

- [ ] **Step 3: Implement `src/lib/tags.ts`**

```ts
export type Tagged = {
  id: string;
  collection: string;
  data: { title: string; pubDate: Date; tags: string[] };
};

/** Every distinct tag with its usage count, sorted alphabetically. */
export function collectTags(entries: Tagged[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export function entriesForTag(entries: Tagged[], tag: string): Tagged[] {
  return entries.filter((entry) => entry.data.tags.includes(tag));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bunx vitest run tests/tags.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create `src/pages/tags/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { collectTags } from '../../lib/tags';
import { isPublished } from '../../lib/entries';

const names = ['blog', 'projects', 'papers', 'books', 'talks'] as const;
const all = (
  await Promise.all(names.map((n) => getCollection(n)))
).flat().filter((e) => isPublished(e));

const tags = collectTags(all as any);
---

<BaseLayout title="Tags · Vivesh Yadav" description="Everything by topic." wide>
  <h1>Tags</h1>
  <p class="blurb">Everything on this site, by topic.</p>
  <ul class="tags">
    {tags.map(({ tag, count }) => (
      <li>
        <a href={`/tags/${tag}/`}>#{tag}</a>
        <span class="count">{count}</span>
      </li>
    ))}
  </ul>
</BaseLayout>

<style>
  .blurb {
    color: var(--ink-soft);
    margin-bottom: 2rem;
  }
  .tags {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .tags li {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.2em 0.75em;
    font-size: 0.9rem;
  }
  .count {
    color: var(--ink-soft);
    margin-left: 0.4em;
    font-size: 0.8rem;
  }
</style>
```

- [ ] **Step 6: Create `src/pages/tags/[tag].astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import EntryRow from '../../components/EntryRow.astro';
import { collectTags, entriesForTag } from '../../lib/tags';
import { byNewest, isPublished } from '../../lib/entries';
import { cleanSlug } from '../../lib/slug';

const NAMES = ['blog', 'projects', 'papers', 'books', 'talks'] as const;

export async function getStaticPaths() {
  const names = ['blog', 'projects', 'papers', 'books', 'talks'] as const;
  const all = (
    await Promise.all(names.map((n) => getCollection(n)))
  ).flat().filter((e) => isPublished(e));

  return collectTags(all as any).map(({ tag }) => ({
    params: { tag },
    props: { entries: entriesForTag(all as any, tag) },
  }));
}

const { tag } = Astro.params;
const { entries } = Astro.props;

const LABELS: Record<string, string> = {
  blog: 'Blog',
  projects: 'Projects',
  papers: 'Papers',
  books: 'Books',
  talks: 'Talks',
};

const grouped = NAMES.map((name) => ({
  name,
  label: LABELS[name],
  items: byNewest(entries.filter((e: any) => e.collection === name)),
})).filter((g) => g.items.length > 0);
---

<BaseLayout
  title={`#${tag} · Vivesh Yadav`}
  description={`Everything tagged ${tag}.`}
  wide
>
  <h1>#{tag}</h1>
  {grouped.map((group) => (
    <section>
      <h2>{group.label}</h2>
      <ul>
        {group.items.map((entry: any) => (
          <EntryRow
            href={`/${group.name}/${cleanSlug(entry.id)}/`}
            title={entry.data.title}
            date={entry.data.pubDate}
          />
        ))}
      </ul>
    </section>
  ))}
</BaseLayout>

<style>
  section {
    margin-top: 2.5rem;
  }
  h2 {
    font-size: 1.1rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.4rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
```

- [ ] **Step 7: Add the Tags link to the nav**

In `src/data/site.yaml`, insert before the About entry:

```yaml
  - { label: Tags, href: /tags/ }
```

- [ ] **Step 8: Verify**

Run: `bun run test` — expected PASS.
Run: `bun run check` — expected `0 errors`.
Run: `bun run build` — expected exit 0.

```bash
test -f dist/tags/index.html && echo "tag index OK"
test -f dist/tags/llm/index.html && echo "tag page OK"
grep -q 'Papers' dist/tags/llm/index.html && echo "cross-collection OK"
```

The last check confirms the `llm` tag page shows both the seed paper and any tagged post — the whole point of cross-collection tags.

- [ ] **Step 9: Commit**

```bash
git add src/lib/tags.ts tests/tags.test.ts src/pages/tags/ src/data/site.yaml
git commit -m "feat: cross-collection tag pages"
```

---

### Task 8: RSS, 404, and favicon assets

**Files:**
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/404.astro`
- Create: `public/favicon.svg`
- Create: `public/robots.txt`

**Interfaces:**
- Consumes: `SITE_TITLE`, `SITE_DESCRIPTION`, `cleanSlug`, `byNewest`, `isPublished`, `summarize`.
- Produces: `/rss.xml` containing published blog posts, newest first.

- [ ] **Step 1: Create `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { cleanSlug } from '../lib/slug';
import { byNewest, isPublished } from '../lib/entries';
import { summarize } from '../lib/summary';

export async function GET(context: APIContext) {
  const posts = byNewest((await getCollection('blog')).filter((e) => isPublished(e)));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? summarize(post.body ?? ''),
      pubDate: post.data.pubDate,
      link: `/blog/${cleanSlug(post.id)}/`,
    })),
  });
}
```

- [ ] **Step 2: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Not found · Vivesh Yadav" description="Page not found.">
  <h1>404</h1>
  <p>That page does not exist.</p>
  <p><a href="/">Back home →</a></p>
</BaseLayout>
```

- [ ] **Step 3: Create `public/favicon.svg`**

A placeholder monogram in the accent color, replaceable later:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0f766e"/>
  <text x="32" y="44" font-family="system-ui, sans-serif" font-size="36"
        font-weight="700" fill="#fcfcfa" text-anchor="middle">V</text>
</svg>
```

- [ ] **Step 4: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://viveshy.com/sitemap-index.xml
```

- [ ] **Step 5: Verify**

Run: `bun run build` — expected exit 0.

```bash
test -f dist/rss.xml && echo "rss OK"
test -f dist/404.html && echo "404 OK"
test -f dist/sitemap-index.xml && echo "sitemap OK"
grep -q '<item>' dist/rss.xml && echo "rss has items"
grep -q '2026-08-16-hello' dist/rss.xml && echo "FAIL: date prefix leaked into RSS"
```

The last line must print nothing. If it prints the failure message, `cleanSlug` was not applied to the RSS link.

- [ ] **Step 6: Commit**

```bash
git add src/pages/rss.xml.ts src/pages/404.astro public/
git commit -m "feat: rss feed, 404 page, favicon, robots.txt"
```

---

### Task 9: Internal link checker (TDD)

The gate that catches real breakage as the site grows. Crawls `dist/`, resolves every internal `href`, and fails on any that has no corresponding output file.

**Files:**
- Create: `scripts/check-links.mjs`
- Test: `tests/check-links.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `checkLinks(distDir: string): Promise<{ file: string; href: string }[]>` — the list of broken links, empty when clean. CLI entry: `node scripts/check-links.mjs dist`, exit code 1 if any are broken.

- [ ] **Step 1: Write the failing test**

Create `tests/check-links.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run tests/check-links.test.ts`
Expected: FAIL — cannot resolve `../scripts/check-links.mjs`.

- [ ] **Step 3: Implement `scripts/check-links.mjs`**

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run tests/check-links.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the checker against the real build**

Run: `bun run build && bun run check:links`
Expected: `All internal links resolve.`

If it reports broken links, fix them before continuing — that is the checker doing its job. The likeliest cause is a nav or footer href missing its trailing slash.

- [ ] **Step 6: Run the whole suite**

Run: `bun run test`
Expected: PASS, 24 tests across 5 files.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-links.mjs tests/check-links.test.ts
git commit -m "feat: internal link checker with tests"
```

---

### Task 10: CI, deploy, and the live domain

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `public/CNAME`
- Create: `README.md`

**Interfaces:**
- Consumes: the `test`, `check`, `build`, and `check:links` package scripts from Task 1.
- Produces: a deployed site at `https://viveshy.com`.

- [ ] **Step 1: Create `public/CNAME`**

```
viveshy.com
```

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# One deploy at a time; cancel superseded runs.
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - run: bun install --frozen-lockfile

      - name: Unit tests
        run: bun run test

      - name: Type and schema check
        run: bun run check

      - name: Build
        run: bun run build

      - name: Check internal links
        run: bun run check:links

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Create `README.md`**

```markdown
# viveshy.com

Personal site — blog, projects, papershelf, bookshelf, talks.
Astro 7, static, deployed to GitHub Pages.

## Develop

```bash
bun install
bun run dev      # drafts are visible here
```

## Verify

```bash
bun run test         # unit tests for lib/ and scripts/
bun run check    # types + content schema validation
bun run build
bun run check:links
```

## Publish

Push to `main`. GitHub Actions builds and deploys.

## Writing

| Section | Location | Format |
|---|---|---|
| Blog | `src/content/blog/YYYY-MM-DD-slug/index.mdx` | folder + `images/` |
| Projects | `src/content/projects/YYYY-MM-DD-slug/index.mdx` | folder + `images/` |
| Papers | `src/content/papers/slug.md` | single file |
| Books | `src/content/books/slug.md` | single file |
| Talks | `src/content/talks/slug.md` | single file |

The date prefix sorts files on disk and is stripped from the URL.
Set `draft: true` to keep something out of production.

Design decisions live in `docs/superpowers/specs/`.
```

- [ ] **Step 4: Verify the full CI sequence locally**

Run each in order, confirming exit 0 for all four:

```bash
bun install --frozen-lockfile && bun run test && bun run check && bun run build && bun run check:links
```

- [ ] **Step 5: Commit**

```bash
git add .github/ public/CNAME README.md
git commit -m "ci: build, test, and deploy to GitHub Pages"
```

- [ ] **Step 6: Confirm the git identity before any push**

Run: `git log -1 --format='%an <%ae>'`
Expected: `viveshy <viveshofficial@gmail.com>`

**If this shows `vivesh-cn` or the cloudnuro address, stop.** The commits carry the wrong identity and must be rewritten before pushing, not after.

- [ ] **Step 7: Create the GitHub repository**

This step needs the user — `gh` is not installed on this machine. Ask them to create a **public** repository named `viveshy.github.io` under the `viveshy` account, with no README, no `.gitignore`, and no license.

- [ ] **Step 8: Add the remote using the personal SSH alias and push**

```bash
git remote add origin git@github.com-viveshy:viveshy/viveshy.github.io.git
git remote -v
git push -u origin main
```

The host must be `github.com-viveshy`, not `github.com` — plain `github.com` uses the work key and will push as `vivesh-cn`.

- [ ] **Step 9: Enable Pages and verify the first deploy**

In the repo settings, set Pages source to **GitHub Actions**. Watch the workflow run and confirm all five steps pass. The site should be live at `https://viveshy.github.io/`.

- [ ] **Step 10: Point the domain**

Read the current GitHub Pages apex IP addresses from GitHub's own documentation — do not use remembered values:

```bash
curl -s https://api.github.com/meta | python3 -c "import json,sys; print(json.load(sys.stdin)['pages'])"
```

At Namecheap, add four `A` records for `@` pointing at those addresses, and a `CNAME` record for `www` pointing at `viveshy.github.io.`. Then in repo settings set the custom domain to `viveshy.com` and, once the DNS check passes, tick **Enforce HTTPS**.

- [ ] **Step 11: Verify the live site**

```bash
curl -sSI https://viveshy.com | head -5
curl -sS https://viveshy.com/rss.xml | head -5
```

Expected: `HTTP/2 200` for both.

Then check by hand: light and dark themes, a mobile viewport, the RSS feed in a reader, and one entry page per collection.

- [ ] **Step 12: Final commit**

```bash
git add -A
git commit -m "docs: record deployment configuration"
git push
```

---

## Post-launch open items

These are content inputs, not code. The site builds and deploys without them, but it is not launch-ready until they are supplied:

- Real bio and tagline in `src/pages/index.astro` and `src/content/about.mdx`
- Real LinkedIn and X handles in `src/data/site.yaml` (currently placeholder URLs)
- A real favicon replacing the placeholder monogram in `public/favicon.svg`
- An OG image at `public/og-default.png`, 1200×630 — currently referenced by `BaseHead` but not present, so social previews will show no image until it is added
- Delete or replace the five seed content entries

Separately tracked, out of scope: revoke the plaintext PAT in `~/.gitconfig`.
