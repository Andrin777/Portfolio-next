# Portfolio — Andrin Nyffeler

My personal portfolio website built with Next.js 15, React 19, TypeScript and Sanity as a headless CMS. Deployed on Netlify with continuous deployment from this repository.

**Live:** [andrin777.netlify.app](https://andrin777.netlify.app)

---

## About

This portfolio was built as the final project for the Webtechnologies module at ZHdK (Spring 2026). The goal was to create a personal portfolio that is easy to maintain and extend, without needing to touch the codebase every time a new project is added.

All content is managed through Sanity Studio, a headless CMS that serves project data via API to the Next.js frontend. New projects can be added, edited or removed entirely through the CMS interface. The site uses Next.js App Router with static generation, meaning pages are pre-built at deploy time but still pull dynamic content from Sanity.

The homepage features a custom canvas animation carried over and reworked from an earlier single-file HTML prototype of the portfolio.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript |
| CMS | Sanity (headless) |
| Styling | CSS Modules |
| Deployment | Netlify |
| Version Control | Git / GitHub |

---

## Features

- Canvas animation on the homepage (ASCII / particle effect)
- Dynamically generated project pages via Sanity API, no new HTML file needed per project
- Content fully managed through Sanity Studio (title, description, images, tags, links)
- Mobile-responsive layout
- Accessibility improvements: semantic HTML, correct heading hierarchy, ARIA attributes
- Performance optimisations: static generation, image optimisation via Next.js `<Image>`
- Embedded Sanity Studio at `/studio` for easy content editing

---

## Project Structure

```
portfolio-next/
├── app/
│   ├── page.tsx              # Homepage with canvas animation
│   ├── work/
│   │   └── [slug]/
│   │       └── page.tsx      # Dynamically generated project pages
│   └── studio/
│       └── [[...tool]]/
│           └── page.tsx      # Embedded Sanity Studio
├── components/               # Reusable UI components
├── sanity/
│   ├── schemaTypes/          # Content schema definitions
│   └── structure.ts          # Studio navigation structure
├── sanity.config.ts          # Sanity project configuration
├── next.config.ts            # Next.js configuration
└── public/                   # Static assets (fonts, icons)
```

---

## Content Model

Projects in Sanity are defined with the following fields:

- **Title** — project name
- **Slug** — used to generate the URL
- **Description** — short summary
- **Body** — rich text content
- **Main image** — cover image
- **Tags** — for filtering / categorisation
- **Year** — when the project was made

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Sanity project ([sanity.io](https://sanity.io))

### Install

```bash
cd portfolio-next
npm install
```

### Environment Variables

Create a `.env.local` file inside `portfolio-next/`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Run locally

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Sanity Studio is accessible at [http://localhost:3000/studio](http://localhost:3000/studio).

### Build

```bash
npm run build
npm run start
```

---

## Deployment

The project is deployed on Netlify via continuous deployment from the `main` branch. The `netlify.toml` in the repository root handles the build configuration and sets the correct publish directory.

### Key deployment challenge

Sanity environment variables must be added manually in Netlify's environment settings under **Site configuration → Environment variables**. They are not read from `.env.local` in production. The variables needed are:

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
```

Additionally, the `sanity.cli.ts` reads these variables at build time via `process.env.NEXT_PUBLIC_SANITY_*`, making sure the variable names are consistent across `sanity.config.ts`, `sanity.cli.ts` and the Netlify dashboard was a key part of getting the deployment to work correctly.

---

## Development Process

The project went through several iterations:

1. **Prototype** — single HTML file with canvas animation and hardcoded content
2. **Next.js migration** — moved to App Router structure with TypeScript
3. **Sanity integration** — set up headless CMS, defined content schemas, connected API
4. **Styling & responsiveness** — built out the design, added mobile layout
5. **Accessibility pass** — fixed heading order, added semantic HTML and ARIA attributes
6. **Deployment & debugging** — resolved Netlify build issues related to environment variables and Sanity runtime files

---

## Course Context

**Module:** Webtechnologies
**School:** ZHdK — Zürcher Hochschule der Künste
**Semester:** Spring 2026
**Lecturer:** Jonas Scheiwiller
