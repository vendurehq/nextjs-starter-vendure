import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..', '..');

async function findMessageFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await findMessageFiles(file)));
        } else if (entry.name.endsWith('.json') && path.basename(directory) === 'messages') {
            files.push(path.relative(root, file));
        }
    }
    return files;
}

test('every message file is registered in the locale message loader', async () => {
    const discovered = (await findMessageFiles(path.join(root, 'src'))).sort();
    const loader = await readFile(path.join(root, 'src/platform/i18n/messages.ts'), 'utf8');
    const registered = [...loader.matchAll(/import\('@\/([^']+)'\)/g)]
        .map(match => path.join('src', match[1]))
        .sort();
    assert.deepEqual(registered, discovered);
});

test('message namespaces are unique per locale', async () => {
    const owners = new Map();
    for (const file of await findMessageFiles(path.join(root, 'src'))) {
        const locale = path.basename(file, '.json');
        const messages = JSON.parse(await readFile(path.join(root, file), 'utf8'));
        for (const namespace of Object.keys(messages)) {
            const key = `${locale}:${namespace}`;
            assert.ok(
                !owners.has(key),
                `Namespace "${namespace}" for locale "${locale}" is defined in both ${owners.get(key)} and ${file}.`,
            );
            owners.set(key, file);
        }
    }
});
