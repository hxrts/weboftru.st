# AGENTS.md

Guidance for AI coding agents working in this repository. This file covers
site-feature conventions; see `CLAUDE.md` (local, untracked) for the full
project overview: Zola stack, template system, styling architecture, and the
blog style guide.

## TikZ figures (client-side TikZJax)

Blog posts can render TikZ diagrams in the browser, mirroring the system in
the sibling `../ep-presentation` repo (Slidev + `slidev-addon-tikzjax`).

### Usage

Wrap a picture in the `tikz` shortcode inside a post's markdown:

    {% tikz(fig_w="520px") %}
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
- The shortcode body is passed through byte-raw (markdown is not applied, and
  Tera autoescape is off), so write plain TikZ/TeX.
- Do not add `\begin{document}`; TikZJax wraps the body itself. Use
  `\usetikzlibrary{...}` for extra libraries (`arrows.meta`,
  `decorations.markings`).

### How it renders

- `templates/shortcodes/tikz.html` emits `<div class="tikz-fig">` +
  `<script type="text/tikz">`.
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