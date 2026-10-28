import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tikzjax from 'node-tikzjax';
import '../static/tikzjax/ligatures.js';
import { cached, digest, fingerprint } from './diagram-cache.mjs';

const tex2svg = tikzjax.default;

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputRoot = path.resolve(projectRoot, process.argv[2] ?? 'public');
const renderer = await fingerprint(['scripts/render-tikz.mjs', 'scripts/diagram-cache.mjs', 'static/tikzjax/ligatures.js', 'package-lock.json'].map(file => path.join(projectRoot, file)));
let cacheHits = 0;

async function* htmlFiles(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            yield* htmlFiles(entryPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            yield entryPath;
        }
    }
}

let figuresRendered = 0;
for await (const htmlPath of htmlFiles(outputRoot)) {
    const html = await readFile(htmlPath, 'utf8');
    const figurePattern = /<figure\b(?=[^>]*\bclass=(?:"tikz-fig"|tikz-fig)(?=[\s>]))([^>]*)>\s*<div class=(?:"tikz-fig-body"|tikz-fig-body)>\s*<script type=(?:"text\/tikz"|text\/tikz)>([\s\S]*?)<\/script>\s*<\/div>/g;
    let renderedInPage = 0;
    const output = await replaceAsync(html, figurePattern, async (_match, attributes, source) => {
        const preparedSource = globalThis.preventFlLigatures(source);
        const result = await cached('tikz', digest(renderer, preparedSource), async () => {
            const svg = await tex2svg(`\\begin{document}${preparedSource}\\end{document}`);
            if (!svg.startsWith('<svg')) throw new Error(`TikZJax returned invalid SVG for ${htmlPath}`);
            return svg;
        });
        const svg = result.value;
        if (result.hit) cacheHits++;
        if (!svg.startsWith('<svg')) {
            throw new Error(`TikZJax returned invalid SVG for ${htmlPath}`);
        }
        renderedInPage++;
        figuresRendered++;
        const retainedAttributes = attributes.replace(/\sclass=(?:"tikz-fig"|tikz-fig)(?=\s|$)/, '');
        return `<figure class="tikz-fig" data-processed="true"${retainedAttributes}><div class="tikz-fig-body">${svg}</div>`;
    });
    if (/<script type=(?:"text\/tikz"|text\/tikz)>/.test(output)) {
        throw new Error(`Uncompiled TikZ source remains in ${htmlPath}; update the build renderer for the emitted markup`);
    }

    if (renderedInPage > 0) {
        const pagePath = path.relative(outputRoot, htmlPath);
        const pageDirectory = path.posix.dirname(pagePath);
        const fontStylesheet = path.posix.relative(pageDirectory, 'tikzjax/fonts.css');
        const href = fontStylesheet.startsWith('.') ? fontStylesheet : `./${fontStylesheet}`;
        const withFontStylesheet = output.replace(
            /<head(?:\s[^>]*)?>/i,
            (head) => `${head}<link rel="stylesheet" href="${href}">`,
        );
        if (withFontStylesheet === output) {
            throw new Error(`Could not add TikZ font stylesheet to ${htmlPath}`);
        }
        await writeFile(htmlPath, withFontStylesheet);
        console.log(`Rendered ${renderedInPage} TikZ figure(s) in ${path.relative(outputRoot, htmlPath)}`);
    }
}

console.log(`Built ${figuresRendered} TikZ figure(s): ${cacheHits} cached, ${figuresRendered - cacheHits} compiled.`);

async function replaceAsync(input, pattern, replacer) {
    const matches = [...input.matchAll(pattern)];
    let output = '';
    let cursor = 0;
    for (const match of matches) {
        output += input.slice(cursor, match.index);
        output += await replacer(...match);
        cursor = match.index + match[0].length;
    }
    return output + input.slice(cursor);
}
