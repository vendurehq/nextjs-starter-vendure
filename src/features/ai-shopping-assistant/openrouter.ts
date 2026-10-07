import type {CompletionFailure, StructuredCompletionProvider, StructuredCompletionResult} from './intent-extraction';

// Server-only OpenRouter transport. This is the only module that may read OPENROUTER_API_KEY;
// an architecture test keeps it out of client bundles. It must stay free of runtime imports.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
/** Free model with native strict JSON schema support; override with OPENROUTER_MODEL. */
export const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';
export const OPENROUTER_TIMEOUT_MS = 20_000;
/** Reasoning models spend completion tokens before answering, so leave room beyond the small JSON answer. */
const MAX_COMPLETION_TOKENS = 2000;

/** Whether an API key is configured. Reports presence only, never the value. */
export function isOpenRouterConfigured(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
}

export const requestOpenRouterCompletion: StructuredCompletionProvider = async ({messages, schemaName, schema}) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return fail('not_configured', 'OPENROUTER_API_KEY is not set');

    let response: Response;
    try {
        response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
                messages,
                response_format: {type: 'json_schema', json_schema: {name: schemaName, strict: true, schema}},
                // Only route to providers that honour every parameter above, including the schema.
                provider: {require_parameters: true},
                temperature: 0,
                max_tokens: MAX_COMPLETION_TOKENS,
                stream: false,
            }),
            signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
        });
    } catch (error) {
        return error instanceof Error && error.name === 'TimeoutError'
            ? fail('timeout', `no response within ${OPENROUTER_TIMEOUT_MS}ms`)
            : fail('provider_error', 'network error');
    }

    if (!response.ok) return fail(failureForStatus(response.status), `HTTP ${response.status}`);

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return fail('provider_error', 'response is not JSON');
    }
    return readCompletion(body);
};

export function failureForStatus(status: number): CompletionFailure {
    if (status === 401 || status === 403) return 'not_configured';
    if (status === 408) return 'timeout';
    if (status === 429) return 'rate_limited';
    return 'provider_error';
}

/** Extract the answer from an OpenAI-compatible completion body, treating every field as untrusted. */
export function readCompletion(body: unknown): StructuredCompletionResult {
    if (!isRecord(body)) return fail('provider_error', 'unexpected response body');
    // OpenRouter reports failures that occur after a request is accepted inside a 200 response.
    if (body.error !== undefined) return fail('provider_error', 'error in response body');

    const choice = Array.isArray(body.choices) ? body.choices[0] : undefined;
    if (!isRecord(choice)) return fail('provider_error', 'no choices');
    if (choice.finish_reason === 'length') return fail('invalid_output', 'answer was truncated');

    const content = isRecord(choice.message) ? choice.message.content : undefined;
    if (typeof content !== 'string' || !content.trim()) return fail('invalid_output', 'empty answer');
    return {ok: true, content};
}

function fail(reason: CompletionFailure, detail: string): StructuredCompletionResult {
    // Log only our own description: never the key, the request, or provider-supplied text.
    console.error(`OpenRouter completion failed (${reason}): ${detail}`);
    return {ok: false, reason};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
