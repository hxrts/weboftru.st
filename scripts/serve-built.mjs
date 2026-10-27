import { watch, readdirSync, statSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 1111);
const baseUrl = `http://127.0.0.1:${port}`;
const workspace = await mkdtemp(path.join(tmpdir(), 'weboftrust-preview-'));
const clients = new Set();
const watchers = [];
const signatures = new Map();
const sourceDirectories = ['content', 'templates', 'sass', 'static', 'syntaxes', 'scripts'];
let reconciliationTimer;
let activeDirectory;
let child;
let building = false;
let pending = false;
let stopping = false;
let timer;
let revision = 0;
const instance = randomUUID();
let buildError;

function previewState() {
    return { version: `${instance}:${revision}`, building, error: buildError };
}

function broadcastState() {
    const message = `data: ${JSON.stringify(previewState())}\n\n`;
    for (const client of clients) client.write(message);
}

function liveReloadScript() {
    const version = JSON.stringify(previewState().version);
    return `<script>(() => {
        const version = ${version};
        let notice;
        new EventSource('/__preview_events').onmessage = event => {
            const state = JSON.parse(event.data);
            if (state.version !== version) { location.reload(); return; }
            if (state.building || state.error) {
                if (!notice) {
                    notice = document.createElement('div');
                    notice.setAttribute('role', 'status');
                    notice.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;z-index:2147483647;padding:10px 14px;background:#222;color:#fff;border:1px solid #888;border-radius:4px;font:14px/1.4 sans-serif;white-space:pre-wrap';
                    document.body.appendChild(notice);
                }
                notice.textContent = state.error
                    ? 'Preview build failed. Showing the last successful build.\\n' + state.error
                    : 'Rebuilding preview…';
            } else if (notice) {
                notice.remove();
                notice = undefined;
            }
        };
    })();</script>`;
}

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
        if (url.pathname === '/__preview_info') {
            response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            response.end(JSON.stringify({ application: 'weboftrust-preview', root, pid: process.pid }));
            return;
        }
        if (url.pathname === '/__preview_events') {
            response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
            response.write(`data: ${JSON.stringify(previewState())}\n\n`);
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
            const reload = liveReloadScript();
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
    buildError = undefined;
    broadcastState();
    while (pending && !stopping) {
        pending = false;
        const output = await mkdtemp(path.join(workspace, 'build-'));
        try {
            console.log('Rebuilding site and TikZ SVGs…');
            await run('./scripts/generate-image-manifest.sh', []);
            await run('zola', ['build', '--drafts', '--base-url', baseUrl, '--force', '--output-dir', output]);
            if (stopping) break;
            await run(process.execPath, ['scripts/render-tikz.mjs', output]);
            await run(process.execPath, ['scripts/render-diagrams.mjs', output]);
            if (stopping) break;
            const previous = activeDirectory;
            activeDirectory = output;
            buildError = undefined;
            revision++;
            broadcastState();
            console.log(`Preview ready at ${baseUrl} (watching for changes)`);
            if (previous) await rm(previous, { recursive: true, force: true });
        } catch (error) {
            buildError = error.message;
            console.error(`Build failed. Keeping the last successful preview. ${error.message}`);
            await rm(output, { recursive: true, force: true });
        }
    }
    building = false;
    broadcastState();
}

function signature(file) {
    try {
        const info = statSync(file);
        return info.isFile() ? `${info.ino}:${info.mtimeMs}:${info.ctimeMs}:${info.size}` : 'directory';
    } catch {
        return 'missing';
    }
}

function ignored(file) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    return relative.startsWith('static/processed_images/')
        || relative === 'static/images/manifest.json'
        || path.basename(file) === '.DS_Store';
}

function remember(directory, snapshot = signatures) {
    let entries;
    try {
        entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return;
        throw error;
    }
    for (const entry of entries) {
        const file = path.join(directory, entry.name);
        if (ignored(file)) continue;
        snapshot.set(file, signature(file));
        if (entry.isDirectory() && path.relative(root, file) !== 'static/processed_images') remember(file, snapshot);
    }
}

function queueRebuild() {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 200);
}

// Native notifications can be lost, especially when editors replace files or
// directories. Reconcile the complete source tree independently of those events.
function reconcile() {
    const snapshot = new Map();
    for (const directory of sourceDirectories) remember(path.join(root, directory), snapshot);
    const config = path.join(root, 'config.toml');
    snapshot.set(config, signature(config));
    const differs = snapshot.size !== signatures.size
        || [...snapshot].some(([file, value]) => signatures.get(file) !== value);
    if (!differs) return;
    signatures.clear();
    for (const [file, value] of snapshot) signatures.set(file, value);
    queueRebuild();
}

function changed(filename, directory = root) {
    const name = String(filename || '').replaceAll('\\', '/');
    if (!name) {
        reconcile();
        return;
    }
    const file = path.join(directory, name);
    if (ignored(file)) return;
    const next = signature(file);
    if (signatures.get(file) === next) return;
    signatures.set(file, next);
    if (next === 'directory') return;
    queueRebuild();
}

async function stop() {
    if (stopping) return;
    stopping = true;
    clearTimeout(timer);
    clearInterval(reconciliationTimer);
    watchers.forEach(watcher => watcher.close());
    child?.kill('SIGTERM');
    clients.forEach(client => client.end());
    server.close();
    while (building) await new Promise(resolve => setTimeout(resolve, 50));
    await rm(workspace, { recursive: true, force: true });
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
let replacementAttempted = false;
server.on('error', async error => {
    if (error.code === 'EADDRINUSE' && !replacementAttempted) {
        replacementAttempted = true;
        try {
            let existing;
            try {
                const response = await fetch(`${baseUrl}/__preview_info`, { signal: AbortSignal.timeout(1500) });
                existing = response.ok ? await response.json() : undefined;
            } catch (failure) {
                // A suspended preview still owns its socket but cannot answer HTTP.
                // Only resume a process whose command and working directory match.
                const pids = execFileSync('lsof', ['-t', '-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' }).trim().split(/\s+/);
                if (pids.length !== 1) throw failure;
                const pid = Number(pids[0]);
                const command = execFileSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' }).trim();
                const cwd = execFileSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' });
                if (!/^node scripts\/serve-built\.mjs$/.test(command)
                    || !cwd.split('\n').includes(`n${root}`)) throw failure;
                existing = { application: 'weboftrust-preview', root, pid };
            }
            if (existing?.application !== 'weboftrust-preview' || existing.root !== root
                || !Number.isInteger(existing.pid) || existing.pid <= 1 || existing.pid === process.pid) {
                throw new Error('the port is occupied by a different service');
            }
            console.log(`Restarting the existing preview for this repository (PID ${existing.pid})…`);
            process.kill(existing.pid, 'SIGTERM');
            // Deliver the pending termination signal even after Ctrl+Z.
            process.kill(existing.pid, 'SIGCONT');
            const deadline = Date.now() + 10000;
            while (true) {
                try {
                    // Wait for the listening socket, not process reaping by its shell.
                    execFileSync('lsof', ['-a', '-p', String(existing.pid), '-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { stdio: 'ignore' });
                } catch (failure) {
                    if (failure.status === 1) break;
                    throw failure;
                }
                if (Date.now() >= deadline) throw new Error('the existing preview did not stop within 10 seconds');
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!stopping) server.listen(port, '127.0.0.1', startWatching);
            return;
        } catch (failure) {
            console.error(`Cannot start preview on ${baseUrl}: ${failure.message}. Use PORT to choose another port.`);
            await stop();
            process.exitCode = 1;
            return;
        }
    }
    console.error(error.message);
    await stop();
    process.exitCode = 1;
});
function startWatching() {
    for (const directory of sourceDirectories) {
        const source = path.join(root, directory);
        remember(source);
        watchers.push(watch(source, { recursive: true }, (_event, filename) => changed(filename, source)));
    }
    // Watch the parent directory so atomic editor saves of config.toml are detected.
    signatures.set(path.join(root, 'config.toml'), signature(path.join(root, 'config.toml')));
    watchers.push(watch(root, (_event, filename) => {
        if (filename === 'config.toml') changed(filename);
    }));
    reconciliationTimer = setInterval(reconcile, 1000);
    rebuild();
}

server.listen(port, '127.0.0.1', startWatching);
