# AGENTS.md

Guidance for AI coding agents working in this repository. This file covers
site-feature conventions; see `CLAUDE.md` (local, untracked) for the full
project overview: Zola stack, template system, styling architecture, and the
blog style guide.

## Draft visibility in post lists

- `zola serve --drafts` (used by `just build-serve`) includes drafts in the
  post list on the homepage (`templates/index.html`) and the `/post/` section
  page (`templates/section.html`).
- Zola exposes `page.draft` (true/false) to templates, so both templates wrap
  the draft post's title in a `draft-tag` pill:
  `{% if page.draft %}<span class="draft-tag">draft</span>{% endif %}`.
- Production `zola build` never sets `draft: true` pages on `section.pages`,
  so draft links and tags are absent from the published site automatically.
  No per-page ``unlisted`` extra is needed for drafts.

## TikZ figures (client-side TikZJax)

Blog posts can render TikZ diagrams in the browser, mirroring the system in
the sibling `../ep-presentation` repo (Slidev + `slidev-addon-tikzjax`).

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
- Do not add `\begin{document}`; TikZJax wraps the body itself. Use
  `\usetikzlibrary{...}` for extra libraries (`arrows.meta`,
  `decorations.markings`).

### How it renders

- `templates/shortcodes/tikz.html` emits `<figure class="tikz-fig">` +
  `<div class="tikz-fig-body">` + `<script type="text/tikz">`, then an
  optional `<figcaption>`.
- `templates/base.html` loads `tikzjax.js` and `fonts.css` only when a page
  contains a `text/tikz` script, using the same conditional-loading pattern
  as the Mermaid loader.
- The engine is TikZJax, a WebAssembly TeX port, vendored so figures work
  offline and same-origin:
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
  images: `s-6`/`s-8` margins, `overflow-x: auto`, fade-in on
  `data-processed`, and centering. Clicking a figure opens the shared
  lightbox (bare SVG, `tikz` class preserved for dark-mode inversion);
  figure numbering includes `.tikz-fig`, so downloads are named
  `{slug}-{n}.svg`.

### Engine layout quirk

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
- Rendering needs http(s): the engine is fetched at page load, so `file://`
  previews show no figure (same limitation as the KaTeX CDN). The first
  render of a figure is slow (browser compiles TeX).
- Figure source lines count toward `wc -w` and are invisible to the
  `≤4 sentences per paragraph` audit, so keep them terse.
- To verify a figure compiles without a browser, compile the same source with
  `node-tikzjax` (available in `../ep-presentation/node_modules`):
  `tex(source, { tikzLibraries: [...] })` then `dvi2svg`.