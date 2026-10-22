import { watch, readdirSync, statSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 1111);
const baseUrl = `http://127.0.0.1:${port}`;
const workspace = await mkdtemp(path.join(tmpdir(), 'weboftrust-preview-'));
const clients = new Set();
const watchers = [];
const signatures = new Map();
let activeDirectory;
let child;
let building = false;
let pending = false;
let stopping = false;
let timer;
let revision = 0;

const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css',
    '.js': 'text/javascript', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
    '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.xml': 'application/xml',
    '.pdf': 'application/pdf',
};

const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url, baseUrl);
        if (url.pathname === '/__preview_events') {
            response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
            response.write(`data: ${revision}\n\n`);
            clients.add(response);
            request.on('close', () => clients.delete(response));
            return;
        }
        if (!activeDirectory) {
            response.writeHead(503, { 'Content-Type': 'text/html', 'Retry-After': '2' });
            response.end('<meta http-equiv="refresh" content="2">Building preview…');
            return;
        }
        const directory = activeDirectory;
        let file = path.resolve(directory, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(directory + path.sep) && file !== directory) {
            response.writeHead(403).end();
            return;
        }
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
        let body = await readFile(file);
        const extension = path.extname(file);
        if (extension === '.html') {
            const reload = `<script>new EventSource('/__preview_events').onmessage = event => { if (Number(event.data) !== ${revision}) location.reload(); };</script>`;
            const html = body.toString();
            body = Buffer.from(html.includes('</body>') ? html.replace('</body>', `${reload}</body>`) : html + reload);
        }
        response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(body);
    } catch (error) {
        response.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400).end();
    }
});

function run(command, args) {
    return new Promise((resolve, reject) => {
        child = spawn(command, args, { cwd: root, stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', code => {
            child = undefined;
            code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`));
        });
    });
}

async function rebuild() {
    pending = true;
    if (building || stopping) return;
    building = true;
    while (pending && !stopping) {
        pending = false;
        const output = await mkdtemp(path.join(workspace, 'build-'));
        try {
            console.log('Rebuilding site and TikZ SVGs…');
            await run('./scripts/generate-image-manifest.sh', []);
            await run('zola', ['build', '--drafts', '--base-url', baseUrl, '--force', '--output-dir', output]);
            if (stopping) break;
            await run(process.execPath, ['scripts/render-tikz.mjs', output]);
            if (stopping) break;
            const previous = activeDirectory;
            activeDirectory = output;
            revision++;
            for (const client of clients) client.write(`data: ${revision}\n\n`);
            console.log(`Preview ready at ${baseUrl} (watching for changes)`);
            if (previous) await rm(previous, { recursive: true, force: true });
        } catch (error) {
            console.error(`Build failed. Keeping the last successful preview. ${error.message}`);
            await rm(output, { recursive: true, force: true });
        }
    }
    building = false;
}

function signature(file) {
    try {
        const info = statSync(file);
        return info.isFile() ? `${info.mtimeMs}:${info.size}` : 'directory';
    } catch {
        return 'missing';
    }
}

function remember(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        signatures.set(file, signature(file));
        if (entry.isDirectory()) remember(file);
    }
}

function changed(filename, directory = root) {
    const name = String(filename || '').replaceAll('\\', '/');
    if (!name || name.startsWith('processed_images') || name.endsWith('images/manifest.json') || name.endsWith('.DS_Store')) return;
    const file = path.join(directory, name);
    const next = signature(file);
    if (signatures.get(file) === next) return;
    signatures.set(file, next);
    if (next === 'directory') return;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 200);
}

async function stop() {
    if (stopping) return;
    stopping = true;
    clearTimeout(timer);
    watchers.forEach(watcher => watcher.close());
    child?.kill('SIGTERM');
    clients.forEach(client => client.end());
    server.close();
    while (building) await new Promise(resolve => setTimeout(resolve, 50));
    await rm(workspace, { recursive: true, force: true });
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('error', async error => {
    console.error(error.message);
    await stop();
    process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
    for (const directory of ['content', 'templates', 'sass', 'static', 'syntaxes', 'scripts']) {
        const source = path.join(root, directory);
        remember(source);
        watchers.push(watch(source, { recursive: true }, (_event, filename) => changed(filename, source)));
    }
    // Watch the parent directory so atomic editor saves of config.toml are detected.
    signatures.set(path.join(root, 'config.toml'), signature(path.join(root, 'config.toml')));
    watchers.push(watch(root, (_event, filename) => {
        if (filename === 'config.toml') changed(filename);
    }));
    rebuild();
});
