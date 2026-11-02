import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { continuityPlotSvg } from './tweet-continuity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: {
    out: { type: 'string', default: 'work/tweet-images' },
    'skip-build': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
} });
if (values.help) {
    console.log('Usage: npm run export:tweets -- [--skip-build] [--out DIRECTORY]\nExports the original blog diagrams on 1800 × 1350 cards with short captions. Builds the site by default.\nInstall a browser with npx playwright install chromium, or set CHROME_CHANNEL=chrome.');
    process.exit(0);
}
if (!values['skip-build']) {
    const result = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
const publicRoot = path.join(root, 'public');
const output = path.resolve(root, values.out);
await mkdir(path.join(output, 'previews'), { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        let filename = path.resolve(publicRoot, `.${pathname}`);
        if (!filename.startsWith(publicRoot + path.sep) && filename !== publicRoot) {
            response.writeHead(403).end(); return;
        }
        if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
        response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] ?? 'application/octet-stream' });
        response.end(await readFile(filename));
    } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
    const launch = { headless: true };
    if (process.env.CHROME_CHANNEL) launch.channel = process.env.CHROME_CHANNEL;
    try { browser = await chromium.launch(launch); }
    catch (error) {
        if (launch.channel) throw error;
        // A system Chrome installation also works without a Playwright browser download.
        browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }
    const figures = [
        ['01-developmental-history.png', 'A developmental history.', 'Schematic response history; arrows indicate proposed developmental links.'],
        ['02-precursor-comparison.png', 'An inherited response can impede joint learning.', 'Removing the green precursor lowers final reader error by ~99%. Both conditions reach 100% accuracy.'],
        ['03-stable-mean.png', 'Controlled construction. Change concealed by a stable mean.', 'Selection +¼ offsets variation −¼, leaving the flower-responsive share unchanged.'],
        ['05-continuity.png', 'Equivalent endpoints, different continuity.', 'In this synthetic experiment, both schedules reach identical parameters, but only the continuous handoff preserves correct classification throughout. The reader’s threshold is fixed at 0.45, and flower-absent scores stay at zero.'],
    ];
    const continuitySvg = await continuityPlotSvg();
    for (const [filename, title, caption] of figures) {
        const page = await browser.newPage({ viewport: { width: 900, height: 675 }, deviceScaleFactor: 2, colorScheme: 'light' });
        try {
            await page.goto(`http://127.0.0.1:${server.address().port}/post/learning-to-be-clean/`, { waitUntil: 'networkidle' });
            const selected = page.locator('figure.tikz-fig').filter({ has: page.locator('figcaption strong', { hasText: title }) });
            if (await selected.count() !== 1) throw new Error(`Expected exactly one figure titled "${title}"`);
            await selected.evaluate(element => element.setAttribute('data-tweet-selected', 'true'));
            const figure = page.locator('[data-tweet-selected]');
            await figure.locator('svg').waitFor();
            if (filename === '05-continuity.png') {
                await figure.locator('.tikz-fig-body').evaluate((body, svg) => body.innerHTML = svg, continuitySvg);
            }
            await figure.evaluate((element) => {
                const card = document.createElement('div');
                card.id = 'tweet-export';
                card.append(element);
                document.body.replaceChildren(card);
            });
            await figure.locator('figcaption').evaluate((element, copy) => {
                const title = element.querySelector('strong');
                element.replaceChildren(title, document.createTextNode(' ' + copy));
            }, caption);
            await page.addStyleTag({ content: `
                html, body { margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; }
                #tweet-export { all: initial; display: flow-root !important; position: absolute !important; top: 0; left: 0; box-sizing: border-box; width: 900px !important; max-width: none !important; height: 675px !important; min-height: 0 !important; margin: 0 !important; padding: 24px 32px; background: white; }
                #tweet-export figure { margin: 0 !important; width: 100% !important; max-width: none !important; opacity: 1 !important; transform: none !important; height: 100% !important; display: flex !important; flex-direction: column !important; }
                #tweet-export .tikz-fig-body { width: 100% !important; overflow: visible !important; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
                #tweet-export svg { display: block !important; width: 100% !important; height: 100% !important; max-width: 100% !important; position: static !important; filter: none !important; }
                #tweet-export figcaption { margin: 32px 0 0 !important; flex: 0 0 auto; font-family: Arial, sans-serif !important; font-size: 21px !important; line-height: 1.5 !important; color: #444 !important; text-align: left !important; }
            ` });
            await figure.locator('svg').evaluate(svg => {
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                // Remove only the web page's responsive placeholder scaffolding.
                svg.closest('.tikz-fig-body').replaceChildren(svg);
            });
            await page.evaluate(() => document.fonts.ready);
            await figure.locator('svg').evaluate(svg => {
                // Crop export-only outer whitespace, preserving every drawn element.
                const { x, y, width, height } = svg.getBBox();
                const margin = 6;
                svg.setAttribute('viewBox', `${x - margin} ${y - margin} ${width + margin * 2} ${height + margin * 2}`);
            });
            await page.locator('#tweet-export').screenshot({ path: path.join(output, filename), animations: 'disabled' });
            await page.setViewportSize({ width: 400, height: 300 });
            await page.locator('#tweet-export').evaluate(card => card.style.zoom = String(400 / 900));
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            await page.screenshot({ path: path.join(output, 'previews', filename), scale: 'css', animations: 'disabled' });
            await unlink(path.join(output, filename.replace('.png', '.svg'))).catch(error => { if (error.code !== 'ENOENT') throw error; });
            console.log(`Exported ${path.relative(root, path.join(output, filename))}`);
        } finally { await page.close(); }
    }
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
