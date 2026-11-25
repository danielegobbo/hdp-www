# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static site for the Hospital Divina Providência (Luanda, Angola), built with Astro and migrated from the old Joomla site `www7`. `README.md` (in Italian) is the editor's guide: commands, frontmatter fields, publishing. Read it before changing content or deploying.

## Commands

- `npm run dev` (http://localhost:4321), `npm run build` (→ `dist/`), `npm run preview`
- `BASE_PATH=/hdp-www npm run build`: build as the GitHub Pages preview does
- `node scripts/gen-favicon.mjs`: regenerates favicons and `src/assets/logo-transparente.png` from `src/assets/logo.png`
- `node scripts/trim-images.mjs`: strips white borders from `src/assets/img/*.jpg`, **overwriting them in place**

There are no tests and no linter; `npm run build` is the check. The scripts import `sharp`, which comes in through Astro and is not a direct dependency.

## Architecture

- **One page = one Markdown file** in `src/content/paginas/` (schema in `src/content.config.ts`). The URL comes from the `slug` frontmatter field, **not from the file path**. The hierarchy comes from `section` (the parent's slug). `src/pages/[...slug].astro` renders every page: breadcrumb, side nav (parent + siblings), child cards. Pages with `section: servicos` get an extra "Como marcar uma consulta" block. Helpers (`filhas`, `ordenar`, `resumo` for auto descriptions) are in `src/lib/paginas.ts`. `rascunho: true` excludes a page from the site.
- **Shared data** (phones, e-mail, address, opening hours, main menu) lives in `src/data/site.ts`. Pages and layout read it from there, so don't hard-code contacts.
- **Base path:** internal links are written as root-absolute (`/servicos/`). For the GitHub Pages preview (`https://danielegobbo.github.io/hdp-www/`, deployed by `.github/workflows/pages.yml` on push to `main`), the `prefisso-base` integration in `astro.config.mjs` rewrites `href`/`src`/`action`/`srcset`/CSS `url()` in the built files when `BASE_PATH` is set. Astro's `base` option is intentionally not set: don't add it, and don't prefix links by hand, or the prefix would be applied twice.
- **Production** is a manual upload of `dist/` to cPanel (Apache). `public/.htaccess` is maintained by hand: 301 redirects from old Joomla URLs (`index.php?option=com_content&view=article&id=N`, `/index.php/...`), 404, cache, security headers. When you rename a page's `slug`, update any redirect pointing to it. `.htaccess` has no effect on GitHub Pages.
- **Images** go in `src/assets/img/`, referenced with relative paths from Markdown/frontmatter. Astro converts them to WebP at build time. Nothing goes in `public/` except files served as-is.

## Conventions

- Site content is in **Angolan Portuguese (`pt-AO`) with pre-1990 Agreement spelling** (direcção, sector, contacto, actualização). Code comments and README are in Italian.
- The style (`src/styles/global.css`) follows the "Savana / Baobab" theme from `../templates/Savana_Baobab_V1.html`; the palette lives in `:root`.
- No client-side JavaScript and no database: keep the site pure HTML + CSS.
- `arquivo/` holds unpublished content from the old site (gitignored, local only). It's a source for new pages but is never published.

## Outside the repo (parent folder `../`)

- `../data/`: backups of the old Joomla sites (`www1`, `www6`, `www7`, `www8` extracted from tar, SQL dumps) with analyses in `www*.md`. Very large: don't scan it recursively. The `configuration.php` files and the dumps contain credentials: never copy them into the repo.
- `../local-www7/`: isolated Docker copy of `www7` (Joomla 3.10, no internet access) for analysis/migration; `docker compose up -d` → http://localhost:8080. See its `README.md`.
