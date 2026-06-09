# Portfolio — Next.js + Sanity CMS

Migration of the static `portfolio_V10.html` into a **Next.js (App Router)**
site backed by **Sanity CMS**, with the Studio embedded at `/studio`.
All content is bilingual (EN / DE).

The original HTML and assets in the parent folder stay untouched — this project
reads from them once, during the content import.

---

## 1. Create a Sanity project (free)

1. Go to <https://www.sanity.io/manage> and create a new project + a dataset
   called `production` (or run `npx sanity@latest init` inside this folder).
2. Note your **Project ID**.
3. Create a write token: **API → Tokens → Add token → Editor**. Copy it.

## 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | the Editor token (import only) |

In sanity.io/manage, add `http://localhost:3000` under **API → CORS origins**
(tick "Allow credentials") so the Studio can talk to your dataset.

## 3. Install & import existing content

```bash
npm install
npm run import     # uploads all images/videos + creates all documents
```

The import reads `../portfolio_V10.html`, extracts the 9 projects, tech stack,
tool receipts and all site copy, uploads every referenced image/video to Sanity,
and creates the documents. It is **safe to re-run** (deterministic IDs → it
replaces instead of duplicating).

## 4. Run

```bash
npm run dev
```

- Site: <http://localhost:3000>
- Studio (edit content): <http://localhost:3000/studio>

---

## Project structure

```
src/
  app/
    layout.tsx              Root layout (fonts, nav, language provider)
    page.tsx                Home (hero, work grid, about, stack, contact)
    work/[slug]/page.tsx    Project detail pages
    studio/[[...tool]]/     Embedded Sanity Studio
  components/               React UI (HomeView, ProjectView, MediaBlocks, …)
  lib/                      Language context + helpers + TS types
  sanity/
    schemaTypes/            Content models (project, siteSettings, stack, …)
    queries.ts              GROQ queries
    client.ts / fetch.ts    Sanity client + resilient fetch wrapper
scripts/
  import-content.mjs        One-time importer from the legacy HTML
sanity.config.ts            Studio config (schemas + structure)
```

## Content model (in the Studio)

- **Site settings** (singleton) — hero, about/bio, journey timeline, "now"
  cards, contact, socials, footer.
- **Projects** — title, slug, year, accent colour, topic, cover, tag,
  description, intro, highlights, flipbook URL, and a flexible **media blocks**
  builder (image galleries, videos, iframe embeds in any order).
- **Work topics** — filter taxonomy referenced by projects.
- **Stack tools** & **Tool receipts** — the tech-stack section data.

## Notes & next steps

- The bespoke interactions from the old site (spiral view, scroll-scrub video,
  canvas backgrounds) are **not** ported yet — this is the clean CMS foundation.
  They can be layered back on top of the React components incrementally.
- The local "Water Calculator" prototype is uploaded as a file asset and shown
  via an iframe embed.
- Deploy on **Vercel**: set the same env vars in the project settings, add your
  production domain to Sanity's CORS origins, and push.

## Useful commands

```bash
npm run dev        # local dev (site + studio)
npm run build      # production build
npm run import     # (re)import content from the legacy HTML
npm run typegen    # generate Sanity schema + TS types (optional)
```
