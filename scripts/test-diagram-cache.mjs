import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fingerprint, digest } from './diagram-cache.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = await mkdtemp(path.join(tmpdir(), 'weboftrust-cache-test-'));
const output = path.join(workspace, 'site');
function run(script) {
    return execFileSync(process.execPath, [path.join(root, 'scripts', script), output], { encoding: 'utf8', cwd: root });
}
async function page(label = 'Original', caption = 'Caption', tikzLabel = 'Cache test') {
    await writeFile(path.join(output, 'index.html'), `<!doctype html><html><head>
    <link rel="stylesheet" href="./style.css">
    <script>document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';</script>
    </head><body><main><article class="post"><div class="post-content">
    <figure class="tikz-fig"><div class="tikz-fig-body"><script type="text/tikz">
    \\begin{tikzpicture}\\node {${tikzLabel}};\\end{tikzpicture}
    </script></div><figcaption>${caption}</figcaption></figure>
    <pre class="mermaid">graph LR; A[${label}] --> B[End]</pre>
    <pre class="mermaid">graph LR; C[Unchanged] --> D[End]</pre>
    </div></article></main>`); // Match Zola's omitted closing body/html tags.
}
try {
    await mkdir(output);
    for (const name of ['fonts', 'tikzjax', 'mermaid.min.js']) {
        await cp(path.join(root, 'static', name), path.join(output, name), { recursive: true });
    }
    await cp(path.join(root, 'public/style.css'), path.join(output, 'style.css'));
    // A fresh output location must not alter content fingerprints.
    const a = path.join(workspace, 'a');
    const b = path.join(workspace, 'b');
    await writeFile(a, 'same'); await writeFile(b, 'same');
    assert.equal(await fingerprint([a]), await fingerprint([b]));
    await writeFile(b, 'changed');
    assert.notEqual(await fingerprint([a]), await fingerprint([b]));

    // Use a unique source on the first pass, independent of any existing cache.
    const unique = digest(workspace).slice(0, 12);
    await page(unique);
    run('render-tikz.mjs'); run('render-diagrams.mjs');
    const compiled = await readFile(path.join(output, 'index.html'), 'utf8');
    assert.ok(compiled.includes(unique), 'First Mermaid diagram must keep its own content');
    assert.ok(compiled.includes('Unchanged'), 'Second Mermaid diagram must keep its own content');
    await page(unique);
    assert.match(run('render-tikz.mjs'), /1 cached, 0 compiled/);
    assert.match(run('render-diagrams.mjs'), /3 cached, 0 rendered/);

    // Editing prose/captions reuses all compiled diagrams and preserves new text.
    await page(unique, 'Revised caption');
    assert.match(run('render-tikz.mjs'), /1 cached, 0 compiled/);
    assert.match(run('render-diagrams.mjs'), /3 cached, 0 rendered/);
    assert.match(await readFile(path.join(output, 'index.html'), 'utf8'), /Revised caption/);

    // One changed Mermaid diagram must not rebuild its neighbors.
    await page(`${unique}Changed`);
    assert.match(run('render-tikz.mjs'), /1 cached, 0 compiled/);
    assert.match(run('render-diagrams.mjs'), /2 cached, 1 rendered/);

    // A changed TikZ source compiles just that figure.
    await page(`${unique}Changed`, 'Caption', unique);
    assert.match(run('render-tikz.mjs'), /0 cached, 1 compiled/);
    assert.match(run('render-diagrams.mjs'), /2 cached, 1 rendered/);

    // Style changes invalidate browser layout and themes, but not TeX compilation.
    await writeFile(path.join(output, 'style.css'), `${await readFile(path.join(output, 'style.css'), 'utf8')}\n/* ${unique} */`);
    await page(`${unique}Changed`, 'Caption', unique);
    assert.match(run('render-tikz.mjs'), /1 cached, 0 compiled/);
    assert.match(run('render-diagrams.mjs'), /0 cached, 3 rendered/);
    console.log('Diagram cache checks passed.');
} finally {
    await rm(workspace, { recursive: true, force: true });
}
