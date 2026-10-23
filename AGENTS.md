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

## TikZ figures (build-time SVG)

Blog posts can include TikZ diagrams, mirroring the system in the sibling
`../ep-presentation` repo (Slidev + `slidev-addon-tikzjax`). Production builds
compile them to inline SVG with `node-tikzjax`, so readers do not wait for
browser-side TeX rendering. `zola serve` still uses the browser renderer for
live previews.

`just build-serve` runs `scripts/serve-built.mjs`, which watches content,
templates, Sass, static assets, syntax definitions, scripts, and `config.toml`.
It also checks file signatures every second to recover missed filesystem
notifications, including changes made through atomic editor saves.
Each change triggers a draft Zola build followed by SVG compilation. The
preview switches to the completed build and reloads connected browsers only
after both succeed, keeping the previous preview available on failure. It
serves at `http://127.0.0.1:1111` by default (`PORT` overrides the port) and uses
temporary build directories that are removed when the server stops.

### Usage

Wrap a picture in the `tikz` shortcode inside a post's markdown:

    {% tikz(fig_w="520px", caption="Optional caption, HTML allowed") %}
    \usetikzlibrary{arrows.meta,decorations.markings}
    \begin{tikzpicture}[
        x=1cm, y=1cm,
        >={Stealth[length=4pt,width=3pt]},
        every node/.style={font=\rmfamily\footnotesize},
      ]
      \node[draw, minimum width=1.2cm, minimum height=0.7cm] (a) at (0,0) {$A$};
      \node[draw, minimum width=1.2cm, minimum height=0.7cm] (b) at (2.5,0) {$B$};
      \draw[->] (a.east) -- node[above] {$\bar w$} (b.west);
    \end{tikzpicture}
    {% end %}

- `fig_w` is optional and sets the rendered width (CSS `--fig-w`); the default
  is the figure's natural size. Set it so wide figures do not overflow.
- `caption` is optional; it renders in a `<figcaption>` below the figure,
  styled like image/Mermaid captions (small, muted, centered). HTML is
  allowed (`<em>…</em>`), like frontmatter `cover_caption` strings; escape
  inner double quotes in the argument.
- The shortcode body is passed through byte-raw (markdown is not applied, and
  Tera autoescape is off), so write plain TikZ/TeX.
- Do not add `\begin{document}`; the build script wraps the body. Use
  `\usetikzlibrary{...}` for extra libraries (`arrows.meta`,
  `decorations.markings`).

### How it renders

- `templates/shortcodes/tikz.html` emits a source `<script type="text/tikz">`
  for Zola previews and the build renderer, followed by an optional
  `<figcaption>`.
- `npm run build` runs `zola build` and then `scripts/render-tikz.mjs`, which
  replaces each source script in the generated HTML with inline SVG and marks
  the figure as processed.
- Production pages avoid loading TikZJax and its WASM engine. The build step
  adds the local font stylesheet only to pages with compiled figures, and the
  browser fetches only the glyph fonts those SVGs use. `templates/base.html`
  loads the preview engine only when an uncompiled `text/tikz` script is
  present, as it is during `zola serve`.
- The development fallback is TikZJax, a WebAssembly TeX port, vendored so
  previews work offline and same-origin:
  - `static/tikzjax/tikzjax.js` — patched to locate the WASM and memory image
    relative to its own URL (stock builds hardcode an S3 base)
  - `static/tikzjax/3f69...wasm` — the TeX engine, plus
    `static/tikzjax/b565...gz` — its prebuilt memory image (163,840,000 bytes
    unpacked). Both are fetched at page load; if either is missing, the engine
    fails with "Could not find file sample.dvi" and no figure appears.
  - `static/tikzjax/fonts.css` + `static/tikzjax/bakoma/ttf/*.ttf` —
    Computer Modern fonts; browsers fetch only glyphs a figure uses
- Dark mode inverts the SVG (`.tikz-fig svg { filter: invert(1) }`),
  matching the Mermaid handling.
- Figures get the same layout treatment as Mermaid diagrams and figure
  images: `s-6`/`s-8` margins, `overflow-x: auto`, and centering. Clicking a figure opens the shared
  lightbox (bare SVG, `tikz` class preserved for dark-mode inversion);
  figure numbering includes `.tikz-fig`, so downloads are named
  `{slug}-{n}.svg`.

### Preview engine layout quirk

The engine renders `<figure class="tikz-fig"><div style="width: …pt">` +
`<div class="page" style="height:0">` + `<svg style="position:absolute">`
inside the shortcode's `.tikz-fig-body`. The SCSS neutralizes that
scaffolding (`.tikz-fig-body > div` to `display:block; width:auto`, `.page`
`height:auto`, SVG `position:static`) so `fig_w`, centering, and overflow
behave like Mermaid. If you touch the CSS, preserve those three overrides or
`fig_w` and centering silently break. The lightbox strips the SVG's inline
`position:absolute` for the same reason.

### Pitfalls

- The body must not contain `{% end %}` (ends the shortcode) or
  `</script>` (closes the script tag early).
- Avoid English words with an `ff` ligature in labels: the engine's SVG
  mapping mangles them ("offspring" renders as "o®spring"). Use
  "descendant" instead.
- Client-side preview rendering needs http(s): the engine is fetched at page
  load, so `file://` previews show no figure. The first preview render is slow
  because the browser compiles TeX; production pages use precompiled SVG.
- Figure source lines count toward `wc -w` and are invisible to the
  `≤4 sentences per paragraph` audit, so keep them terse.
- To verify build-time rendering, run `npm ci && npm run build`. To include
  drafts in a local generated site, run `zola build --drafts` followed by
  `node scripts/render-tikz.mjs`.
