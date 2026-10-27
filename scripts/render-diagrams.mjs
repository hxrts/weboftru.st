import { createServer } from 'node:http';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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
    const options = { headless: true };
    if (process.env.CHROME_EXECUTABLE_PATH) options.executablePath = process.env.CHROME_EXECUTABLE_PATH;
    if (process.env.CHROME_CHANNEL) options.channel = process.env.CHROME_CHANNEL;
    try { browser = await chromium.launch(options); }
    catch (error) {
        if (options.executablePath || options.channel) throw error;
        browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }
    let total = 0;
    for await (const file of pages(output)) {
        let html = await readFile(file, 'utf8');
        const mermaidPattern = /<pre\b[^>]*>\s*<code\b[^>]*class=(?:"language-mermaid"|language-mermaid)(?=[\s>])[^>]*>[\s\S]*?<\/code>\s*<\/pre>|<pre\s+class=(?:"mermaid"|mermaid)>[\s\S]*?<\/pre>/g;
        const mermaids = [...html.matchAll(mermaidPattern)];
        const tikzPattern = /<figure\b(?![^>]*data-static-diagram)[^>]*class="tikz-fig"[^>]*>[\s\S]*?<\/figure>/g;
        const tikz = [...html.matchAll(tikzPattern)];
        if (!mermaids.length && !tikz.length) continue;
        const rendered = {};
        for (const theme of mermaids.length ? ['light', 'dark'] : ['light']) {
            const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
            try {
                await page.addInitScript(t => localStorage.setItem('theme', t), theme);
                await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
                await page.goto(`${origin}/${path.relative(output, file).split(path.sep).join('/')}`, { waitUntil: 'networkidle' });
                await page.evaluate(() => document.fonts.ready);
                await page.addScriptTag({ path: path.join(root, 'scripts/align-learning-figures.js') });
                if (mermaids.length) {
                    await page.addScriptTag({ path: path.join(output, 'mermaid.min.js') });
                    await page.addScriptTag({ path: path.join(root, 'scripts/render-mermaid-browser.js') });
                    await page.evaluate(() => window.diagramsRendered);
                }
                await page.evaluate(() => document.fonts.ready);
                rendered[theme] = await page.evaluate(() => {
                    const describe = svg => {
                        const vb = svg.viewBox.baseVal;
                        if (!(vb.width > 0 && vb.height > 0)) throw Error('SVG has no valid viewBox');
                        return { svg: svg.outerHTML, width: vb.width, height: vb.height };
                    };
                    return {
                        tikz: Array.from(document.querySelectorAll('figure.tikz-fig')).map(fig => ({ html: fig.outerHTML, ...describe(fig.querySelector('svg')) })),
                        mermaid: Array.from(document.querySelectorAll('.mermaid')).map(el => describe(el.querySelector('svg'))),
                    };
                });
            } finally { await page.close(); }
        }
        if (rendered.light.tikz.length !== tikz.length || rendered.light.mermaid.length !== mermaids.length) throw Error(`Diagram count mismatch in ${file}`);
        let i = 0;
        html = html.replace(tikzPattern, () => {
            const fig = rendered.light.tikz[i++];
            return fig.html.replace('<figure', '<figure data-static-diagram="true"').replace(/<div class="tikz-fig-body">[\s\S]*?<\/div>/, `<div class="tikz-fig-body">${placeholder([fig])}</div>`);
        });
        i = 0;
        html = html.replace(mermaidPattern, () => {
            const light = rendered.light.mermaid[i];
            const dark = rendered.dark.mermaid[i++];
            return `<div class="mermaid" data-static-diagram="true" data-processed="true">${placeholder([light, dark])}</div>`;
        });
        await writeFile(file, html);
        total += tikz.length + mermaids.length;
        console.log(`Sized ${tikz.length} TikZ and rendered ${mermaids.length} Mermaid diagrams in ${path.relative(output, file)}`);
    }
    console.log(`Built ${total} diagram placeholders with static SVG dimensions.`);
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
function placeholder(variants) {
    const ratio = Math.max(...variants.map(v => v.height / v.width));
    const svgs = variants.map((v, i) => v.svg.replace('<svg', `<svg${variants.length > 1 ? ` data-diagram-theme="${i ? 'dark' : 'light'}"` : ''}`)).join('');
    return `<div class="img-placeholder diagram-placeholder" style="aspect-ratio: 1 / ${ratio};">${svgs}</div>`;
}
