import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: {
    out: { type: 'string', default: 'work/tweet-images' },
    'skip-build': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
} });
if (values.help) {
    console.log('Usage: npm run export:tweets -- [--skip-build] [--out DIRECTORY]\nExports four captioned diagrams at 1800px wide. Builds the site by default.\nInstall a browser with npx playwright install chromium, or set CHROME_CHANNEL=chrome.');
    process.exit(0);
}
if (!values['skip-build']) {
    const result = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
const publicRoot = path.join(root, 'public');
const output = path.resolve(root, values.out);
await mkdir(output, { recursive: true });
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
        ['01-developmental-history.png', 'A developmental history.'],
        ['02-precursor-comparison.png', 'An inherited response can impede joint learning.'],
        ['03-stable-mean.png', 'Controlled construction. Change concealed by a stable mean.'],
        ['05-continuity.png', 'Equivalent endpoints, different continuity.'],
    ];
    for (const [filename, title] of figures) {
        const page = await browser.newPage({ viewport: { width: 1000, height: 1600 }, deviceScaleFactor: 2, colorScheme: 'light' });
        try {
            await page.goto(`http://127.0.0.1:${server.address().port}/post/learning-to-be-clean/`, { waitUntil: 'networkidle' });
            const figure = page.locator('figure.tikz-fig').filter({ has: page.locator('figcaption strong', { hasText: title }) });
            if (await figure.count() !== 1) throw new Error(`Expected exactly one figure titled "${title}"`);
            await figure.locator('svg').waitFor();
            await figure.evaluate(element => {
                const card = document.createElement('div');
                card.id = 'tweet-export';
                card.append(element);
                document.body.replaceChildren(card);
            });
            await page.addStyleTag({ content: `
                html, body { margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; }
                #tweet-export { all: initial; display: flow-root !important; position: absolute !important; top: 0; left: 0; box-sizing: border-box; width: 900px !important; max-width: none !important; height: auto !important; min-height: 0 !important; margin: 0 !important; padding: 32px; background: white; }
                #tweet-export figure { margin: 0 !important; width: 100% !important; max-width: none !important; opacity: 1 !important; transform: none !important; }
                #tweet-export .tikz-fig-body { width: 100% !important; overflow: visible !important; }
                #tweet-export svg { display: block !important; width: 100% !important; height: auto !important; max-width: none !important; position: static !important; filter: none !important; }
                #tweet-export figcaption { margin: 24px 0 0 !important; font-family: Arial, sans-serif !important; font-size: 18px !important; line-height: 1.5 !important; color: #444 !important; text-align: left !important; }
            ` });
            await page.evaluate(() => document.fonts.ready);
            await page.locator('#tweet-export').screenshot({ path: path.join(output, filename), animations: 'disabled' });
            console.log(`Exported ${path.relative(root, path.join(output, filename))}`);
        } finally { await page.close(); }
    }
} finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
