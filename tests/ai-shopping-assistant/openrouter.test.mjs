import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, afterEach, before, beforeEach, mock, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src/features/ai-shopping-assistant/openrouter.ts');
const TEST_KEY = 'sk-or-test-key-never-logged';

let directory;
let openrouter;
let logged;
const originalFetch = globalThis.fetch;
const originalEnv = {key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL};

before(async () => {
    // openrouter.ts has only type imports, so it can be transpiled and loaded on its own.
    const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
        fileName: source,
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    directory = await mkdtemp(path.join(tmpdir(), 'openrouter-'));
    const file = path.join(directory, 'openrouter.mjs');
    await writeFile(file, outputText);
    openrouter = await import(pathToFileURL(file).href);
});

beforeEach(() => {
    process.env.OPENROUTER_API_KEY = TEST_KEY;
    delete process.env.OPENROUTER_MODEL;
    logged = mock.method(console, 'error', () => {});
});

afterEach(() => {
    globalThis.fetch = originalFetch;
    logged.mock.restore();
    restoreEnv('OPENROUTER_API_KEY', originalEnv.key);
    restoreEnv('OPENROUTER_MODEL', originalEnv.model);
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

function restoreEnv(name, value) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}

const request = {
    messages: [{role: 'system', content: 'rules'}, {role: 'user', content: 'laptop under $1500'}],
    schemaName: 'shopping_intent',
    schema: {type: 'object'},
};

const completion = (content, finishReason = 'stop') => ({choices: [{finish_reason: finishReason, message: {content}}]});

function respondWith(status, body) {
    const calls = [];
    globalThis.fetch = async (url, init) => {
        calls.push({url, init});
        return new Response(typeof body === 'string' ? body : JSON.stringify(body), {status});
    };
    return calls;
}

function assertKeyNeverLogged() {
    for (const call of logged.mock.calls) {
        assert.doesNotMatch(call.arguments.map(String).join(' '), new RegExp(TEST_KEY));
    }
}

test('sends a strict structured-output request with the key only in the Authorization header', async () => {
    const calls = respondWith(200, completion('{"query":"laptop"}'));

    assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: true, content: '{"query":"laptop"}'});

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${TEST_KEY}`);
    assert.ok(calls[0].init.signal instanceof AbortSignal);
    assert.doesNotMatch(calls[0].init.body, new RegExp(TEST_KEY));

    const body = JSON.parse(calls[0].init.body);
    assert.equal(body.model, openrouter.DEFAULT_OPENROUTER_MODEL);
    assert.deepEqual(body.messages, request.messages);
    assert.deepEqual(body.response_format, {
        type: 'json_schema',
        json_schema: {name: 'shopping_intent', strict: true, schema: {type: 'object'}},
    });
    assert.deepEqual(body.provider, {require_parameters: true});
    assert.equal(body.temperature, 0);
    assert.equal(body.stream, false);
});

test('uses a free model by default and honours OPENROUTER_MODEL', async () => {
    assert.match(openrouter.DEFAULT_OPENROUTER_MODEL, /:free$/);

    process.env.OPENROUTER_MODEL = 'vendor/other-model:free';
    const calls = respondWith(200, completion('{}'));
    await openrouter.requestOpenRouterCompletion(request);

    assert.equal(JSON.parse(calls[0].init.body).model, 'vendor/other-model:free');
});

test('reports whether a key is configured without exposing it', () => {
    assert.equal(openrouter.isOpenRouterConfigured(), true);

    process.env.OPENROUTER_API_KEY = '';
    assert.equal(openrouter.isOpenRouterConfigured(), false);

    delete process.env.OPENROUTER_API_KEY;
    assert.equal(openrouter.isOpenRouterConfigured(), false);
});

test('does not call OpenRouter without a key', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const calls = respondWith(200, completion('{}'));

    assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: false, reason: 'not_configured'});
    assert.equal(calls.length, 0);
});

test('maps HTTP failures without leaking provider text or the key', async () => {
    const cases = [[401, 'not_configured'], [403, 'not_configured'], [408, 'timeout'], [429, 'rate_limited'], [402, 'provider_error'], [500, 'provider_error'], [503, 'provider_error']];
    for (const [status, reason] of cases) {
        respondWith(status, {error: {code: status, message: `provider says ${TEST_KEY}`}});
        assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: false, reason}, `HTTP ${status}`);
    }
    for (const call of logged.mock.calls) {
        assert.doesNotMatch(call.arguments.map(String).join(' '), /provider says/);
    }
    assertKeyNeverLogged();
});

test('maps timeouts and network errors', async () => {
    globalThis.fetch = async () => {
        throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    };
    assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: false, reason: 'timeout'});

    globalThis.fetch = async () => {
        throw new TypeError('fetch failed');
    };
    assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: false, reason: 'provider_error'});
    assertKeyNeverLogged();
});

test('rejects malformed, empty, truncated and failed completions', async () => {
    const cases = [
        ['not json', 'provider_error'],
        [[], 'provider_error'],
        [{error: {code: 502, message: 'upstream failed'}}, 'provider_error'],
        [{choices: []}, 'provider_error'],
        [completion(null), 'invalid_output'],
        [completion('   '), 'invalid_output'],
        [completion('{"query": "lap', 'length'), 'invalid_output'],
    ];
    for (const [body, reason] of cases) {
        respondWith(200, body);
        assert.deepEqual(await openrouter.requestOpenRouterCompletion(request), {ok: false, reason}, JSON.stringify(body));
    }
    assertKeyNeverLogged();
});
