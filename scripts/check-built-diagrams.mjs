import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.argv[2] ?? 'public');
const server = createServer(async (req, res) => {
    try {
        let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
        const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
        res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
        res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const launch = { headless: true };
if (process.env.CHROME_EXECUTABLE_PATH) launch.executablePath = process.env.CHROME_EXECUTABLE_PATH;
let browser;
try {
    try { browser = await chromium.launch(launch); }
    catch { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
    const posts = (await readdir(path.join(root, 'post'), { withFileTypes: true })).filter(e => e.isDirectory());
    let checks = 0;
    for (const post of posts) for (const theme of ['light', 'dark']) for (const width of [390, 1200]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });
        let release;
        const fonts = new Promise(resolve => { release = resolve; });
        const renderRequests = [];
        await page.addInitScript(value => localStorage.setItem('theme', value), theme);
        await page.route('**/*', async route => {
            const url = route.request().url();
            if (/mermaid\.min\.js|tikzjax\.js|\.wasm(?:$|\?)/.test(url)) renderRequests.push(url);
            if (!url.startsWith(origin)) return route.abort();
            if (route.request().resourceType() === 'font') await fonts;
            return route.continue();
        });
        try {
            await page.goto(`${origin}/post/${post.name}/`, { waitUntil: 'domcontentloaded' });
            const before = await page.locator('.diagram-placeholder').evaluateAll(elements => elements.map(el => {
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                const expected = rect.width * Number(el.style.aspectRatio.split('/')[1]);
                if (Math.abs(expected - rect.height) > .2) throw Error('Wrong reserved aspect ratio');
                if (style.backgroundColor !== getComputedStyle(document.body).backgroundColor) throw Error('Wrong placeholder background');
                return { width: rect.width, height: rect.height };
            }));
            if (await page.locator('script[type="text/tikz"], code.language-mermaid, pre.mermaid').count()) throw Error('Uncompiled source remains');
            release();
            await page.evaluate(() => document.fonts.ready);
            await page.waitForFunction(() => [...document.querySelectorAll('.diagram-placeholder')].every(el => el.classList.contains('loaded')));
            const after = await page.locator('.diagram-placeholder').evaluateAll(els => els.map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
            if (before.some((r, i) => Math.abs(r.width - after[i].width) > .2 || Math.abs(r.height - after[i].height) > .2)) throw Error('Layout shift after fonts loaded');
            let navigations = 0;
            page.on('framenavigated', () => navigations++);
            await page.locator('#themeToggle').click();
            const otherTheme = theme === 'light' ? 'dark' : 'light';
            await page.waitForFunction(t => document.documentElement.dataset.theme === t, otherTheme);
            const wrongVariant = await page.locator('.diagram-placeholder').evaluateAll((els, theme) => els.some(el => {
                const variants = [...el.querySelectorAll('[data-diagram-theme]')];
                return variants.some(svg => (getComputedStyle(svg).display !== 'none') !== (svg.dataset.diagramTheme === theme));
            }), otherTheme);
            if (wrongVariant || navigations || renderRequests.length) throw Error('Theme switch re-rendered or selected wrong SVG');
            for (const selector of ['.mermaid', '.tikz-fig']) {
                const figure = page.locator(selector).first();
                if (!await figure.count()) continue;
                await figure.dispatchEvent('click');
                if (!await page.locator('#lightboxContent svg').count()) throw Error('Lightbox lost SVG');
                const variant = await page.locator('#lightboxContent svg').getAttribute('data-diagram-theme');
                if (variant && variant !== otherTheme) throw Error('Lightbox shows wrong theme');
                await page.keyboard.press('Escape');
            }
            checks += before.length;
        } catch (error) { throw Error(`${post.name}, ${theme}, ${width}px: ${error.message}`); }
        finally { release(); await page.close(); }
    }
    console.log(`Passed ${checks} diagram checks for reserved dimensions, font loading, theme switching, static rendering, and lightboxes.`);
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
