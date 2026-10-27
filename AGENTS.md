# AGENTS.md

Guidance for AI coding agents working in this repository. This file covers
site-feature conventions; see `CLAUDE.md` (local, untracked) for the full
project overview: Zola stack, template system, styling architecture, and the
blog style guide.

## Draft visibility in post lists

- `zola serve --drafts` and `just build-serve` include drafts in the
  post list on the homepage (`templates/index.html`) and the `/post/` section
  page (`templates/section.html`).
- Zola exposes `page.draft` (true/false) to templates, so both templates wrap
  the draft post's title in a `draft-tag` pill:
  `{% if page.draft %}<span class="draft-tag">draft</span>{% endif %}`.
- Production `zola build` never sets `draft: true` pages on `section.pages`,
  so draft links and tags are absent from the published site automatically.
  No per-page ``unlisted`` extra is needed for drafts.

## Static diagrams

Use `npm run build` or `just build` for production and `just build-serve` for preview. Bare `zola build` / `zola serve` do not compile diagrams.

- `scripts/render-tikz.mjs` compiles TikZ shortcode sources into inline SVG using node-tikzjax.
- `scripts/render-diagrams.mjs` uses Playwright at build time to finish TikZ alignment, render Mermaid fenced blocks and shortcodes in both themes, and emit shared `.img-placeholder.diagram-placeholder` wrappers with static aspect ratios.
- `scripts/align-learning-figures.js` and `scripts/render-mermaid-browser.js` are build-only browser helpers. Neither renderer runs on published pages.
- Browser prerequisites are Playwright Chromium (`npx playwright install chromium`), installed Google Chrome, or `CHROME_EXECUTABLE_PATH`. CI installs Chromium; Linux Nix builds use the packaged browser.
- `npm run test:diagrams` checks the built pages at mobile/desktop widths in both themes, including reserved dimensions, delayed fonts, theme switching, renderer requests, and lightboxes.
- Placeholders use `--c-bg` and reveal inline SVGs when fonts are ready. Mermaid variants switch via CSS without reloading. Lightboxes select the active theme.
- Cover dimensions come from Zola’s `get_image_metadata` at build time, independent of the legacy image manifest.

### TikZ authoring

Wrap TikZ in the `tikz` shortcode. Do not add a document environment. Optional `fig_w` sets the maximum display width and `caption` accepts HTML. Optional `learning=true` includes shared helpers from `templates/partials/tikz-learning.html`; `source` and `preamble` load project TeX files. The body passes through raw, so use TeX notation and `\usetikzlibrary{...}` as needed.

Preserve sans serif labels, the global ligature fix, and shared visual conventions when editing learning diagrams. TikZ uses black ink with CSS inversion in dark mode. The static build reserves SVG geometry before fonts load; avoid reintroducing runtime sizing or compilation.
