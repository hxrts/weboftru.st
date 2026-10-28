import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, '.cache', 'diagrams');
export function digest(...parts) {
    return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}
export async function fingerprint(files) {
    const entries = [];
    async function visit(file, name) {
        try {
            const children = await readdir(file);
            for (const child of children.sort()) await visit(path.join(file, child), `${name}/${child}`);
        } catch (error) {
            if (error.code !== 'ENOTDIR') throw error;
            entries.push([name, await readFile(file, 'base64')]);
        }
    }
    for (const [index, file] of files.entries()) await visit(file, String(index));
    return digest(entries);
}
export async function cached(namespace, key, render) {
    const folder = path.join(directory, namespace);
    const file = path.join(folder, `${key}.json`);
    try { return { value: JSON.parse(await readFile(file, 'utf8')), hit: true }; }
    catch (error) {
        if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
    }
    const value = await render();
    await mkdir(folder, { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(value));
    await rename(temporary, file);
    return { value, hit: false };
}
