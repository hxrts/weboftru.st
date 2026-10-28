import { createServer } from 'node:http';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cached, digest, fingerprint } from './diagram-cache.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.argv[2] ?? 'public');
async function* pages(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const name = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* pages(name);
        else if (name.endsWith('.html')) yield name;
    }
}
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
    try {
        let file = path.resolve(output, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!file.startsWith(output + path.sep)) { res.writeHead(403).end(); return; }
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
        res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
        res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    async function launchBrowser() {
        if (browser) return;
        const options = { headless: true };
        if (process.env.CHROME_EXECUTABLE_PATH) options.executablePath = process.env.CHROME_EXECUTABLE_PATH;
        if (process.env.CHROME_CHANNEL) options.channel = process.env.CHROME_CHANNEL;
        try { browser = await chromium.launch(options); }
        catch (error) {
            if (options.executablePath || options.channel) throw error;
            browser = await chromium.launch({ headless: true, channel: 'chrome' });
        }
    }
    const renderer = await fingerprint(['scripts/render-diagrams.mjs', 'scripts/diagram-cache.mjs', 'scripts/align-learning-figures.js', 'scripts/render-mermaid-browser.js', 'package-lock.json'].map(f => path.join(root, f)).concat(['style.css', 'mermaid.min.js', 'fonts', 'tikzjax/fonts.css', 'tikzjax/bakoma'].map(f => path.join(output, f))));
    let hits = 0;
    let total = 0;
    for await (const file of pages(output)) {
        let html = await readFile(file, 'utf8');
        const mermaidPattern = /<pre\b[^>]*>\s*<code\b[^>]*class=(?:"language-mermaid"|language-mermaid)(?=[\s>])[^>]*>[\s\S]*?<\/code>\s*<\/pre>|<pre\s+class=(?:"mermaid"|mermaid)>[\s\S]*?<\/pre>/g;
        const mermaids = [...html.matchAll(mermaidPattern)];
        const tikzPattern = /<figure\b(?![^>]*data-static-diagram)[^>]*class="tikz-fig"[^>]*>[\s\S]*?<\/figure>/g;
        const tikz = [...html.matchAll(tikzPattern)];
        if (!mermaids.length && !tikz.length) continue;
        const replacements = new Map();
        for (const [index, match] of [...tikz, ...mermaids].entries()) {
            const isTikz = tikz.includes(match);
            const caption = isTikz ? match[0].match(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/)?.[0] ?? '' : '';
            const markup = caption ? match[0].replace(caption, '') : match[0];
            const result = await cached('svg', digest(renderer, process.platform, process.arch,
                process.env.CHROME_EXECUTABLE_PATH, process.env.CHROME_CHANNEL, isTikz, markup), async () => {
                await launchBrowser();
                const variants = [];
                let figure;
                for (const theme of isTikz ? ['light'] : ['light', 'dark']) {
                    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
                    try {
                        await page.addInitScript(t => localStorage.setItem('theme', t), theme);
                        const isolated = html.replace(/<body\b[^>]*>[\s\S]*?<\/body>/i,
                            () => `<body><main><article class="post"><div class="post-content">${markup}</div></article></main></body>`);
                        const pageUrl = `${origin}/${path.relative(output, file).split(path.sep).join('/')}`;
                        await page.route('**/*', route => {
                            const url = route.request().url();
                            if (url === pageUrl) return route.fulfill({ contentType: 'text/html', body: isolated });
                            return url.startsWith(origin) ? route.continue() : route.abort();
                        });
                        await page.goto(pageUrl, { waitUntil: 'networkidle' });
                        await page.evaluate(() => document.fonts.ready);
                        await page.addScriptTag({ path: path.join(root, 'scripts/align-learning-figures.js') });
                        if (!isTikz) {
                            await page.addScriptTag({ path: path.join(output, 'mermaid.min.js') });
                            await page.addScriptTag({ path: path.join(root, 'scripts/render-mermaid-browser.js') });
                            await page.evaluate(() => window.diagramsRendered);
                        }
                        await page.evaluate(() => document.fonts.ready);
                        const rendered = await page.evaluate(() => {
                            const svg = document.querySelector('figure.tikz-fig svg, .mermaid svg');
                            if (!svg) throw Error('Diagram did not produce an SVG');
                            const vb = svg.viewBox.baseVal;
                            if (!(vb.width > 0 && vb.height > 0)) throw Error('SVG has no valid viewBox');
                            return { svg: svg.outerHTML, width: vb.width, height: vb.height,
                                figure: document.querySelector('figure.tikz-fig')?.outerHTML };
                        });
                        variants.push(rendered);
                        figure = rendered.figure;
                    } finally { await page.close(); }
                }
                if (isTikz) return figure.replace('<figure', '<figure data-static-diagram="true"')
                    .replace(/<div class="tikz-fig-body">[\s\S]*?<\/div>/, () => `<div class="tikz-fig-body">${placeholder(variants)}</div>`);
                return `<div class="mermaid" data-static-diagram="true" data-processed="true">${placeholder(variants)}</div>`;
            });
            if (result.hit) hits++;
            const value = caption ? result.value.replace('</figure>', () => `${caption}</figure>`) : result.value;
            replacements.set(match.index, scopeIds(value, `diagram-${digest(path.relative(output, file), index).slice(0, 16)}-`));
        }
        for (const match of [...tikz, ...mermaids].sort((a, b) => b.index - a.index)) {
            html = html.slice(0, match.index) + replacements.get(match.index) + html.slice(match.index + match[0].length);
        }
        await writeFile(file, html);
        total += tikz.length + mermaids.length;
        console.log(`Sized ${tikz.length} TikZ and rendered ${mermaids.length} Mermaid diagrams in ${path.relative(output, file)}`);
    }
    console.log(`Built ${total} diagram placeholders: ${hits} cached, ${total - hits} rendered.`);
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
function placeholder(variants) {
    const ratio = Math.max(...variants.map(v => v.height / v.width));
    const svgs = variants.map((v, i) => v.svg.replace('<svg', `<svg${variants.length > 1 ? ` data-diagram-theme="${i ? 'dark' : 'light'}"` : ''}`)).join('');
    return `<div class="img-placeholder diagram-placeholder" style="aspect-ratio: 1 / ${ratio};">${svgs}</div>`;
}

// Cached SVGs can appear more than once on a page. Keep their definitions,
// CSS selectors, links, and accessibility references independent.
function scopeIds(html, prefix) {
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    html = html.replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`);
    html = html.replace(/#([\w:.-]+)/g, (match, id) => ids.has(id) ? `#${prefix}${id}` : match);
    return html.replace(/\b(aria-labelledby|aria-describedby)="([^"]+)"/g,
        (_, attribute, value) => `${attribute}="${value.split(/\s+/).map(id => ids.has(id) ? prefix + id : id).join(' ')}"`);
}
