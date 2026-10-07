import type {CatalogSearchOptions, CatalogSearchResult} from './catalog-search';
import {parseShoppingIntent, type ShoppingIntent} from './intent';
import {
    buildIntentMessages,
    buildIntentSchema,
    INTENT_SCHEMA_NAME,
    MAX_REQUEST_LENGTH,
    parseModelContent,
    toShoppingIntentInput,
    type CompletionFailure,
    type CurrencyMismatchNotice,
    type StructuredCompletionProvider,
} from './intent-extraction';

// The assistant flow with its I/O injected. Runtime imports are limited to pure sibling modules,
// so tests can run every branch without Next.js, Vendure, or a language model provider.

export interface ShoppingAssistantOptions {
    languageCode: string;
    currencyCode: string;
}

export interface ShoppingAssistantDependencies {
    completeStructured: StructuredCompletionProvider;
    loadCollectionSlugs: (languageCode: string) => Promise<string[]>;
    searchCatalog: (intent: ShoppingIntent, options: CatalogSearchOptions) => Promise<CatalogSearchResult>;
}

export type ShoppingAssistantResult =
    | (Extract<CatalogSearchResult, { status: 'ok' }> & { intent: ShoppingIntent; notices: CurrencyMismatchNotice[] })
    /** The request contained no criteria that could be searched, such as small talk. */
    | { status: 'no_criteria'; notices: CurrencyMismatchNotice[] }
    | { status: 'invalid_request' }
    | { status: 'unavailable'; reason: CompletionFailure | 'catalog_error' };

/**
 * Answer a natural-language shopping request with real catalog products.
 * The language model only proposes a ShoppingIntent; the catalog is searched only after that
 * intent passes validation, and every product comes from the catalog search.
 */
export async function runShoppingAssistant(
    text: string,
    {languageCode, currencyCode}: ShoppingAssistantOptions,
    {completeStructured, loadCollectionSlugs, searchCatalog}: ShoppingAssistantDependencies,
): Promise<ShoppingAssistantResult> {
    const request = text.replace(/\s+/g, ' ').trim();
    if (!request || request.length > MAX_REQUEST_LENGTH) return {status: 'invalid_request'};

    let collectionSlugs: string[];
    try {
        collectionSlugs = await loadCollectionSlugs(languageCode);
    } catch (error) {
        console.error('Shopping assistant could not load collections:', error);
        return {status: 'unavailable', reason: 'catalog_error'};
    }

    const context = {collectionSlugs, currencyCode};
    const completion = await completeStructured({
        messages: buildIntentMessages(request, context),
        schemaName: INTENT_SCHEMA_NAME,
        schema: buildIntentSchema(collectionSlugs),
    });
    if (!completion.ok) return {status: 'unavailable', reason: completion.reason};

    const content = parseModelContent(completion.content);
    if (!content.ok) return rejectOutput('content is not JSON');

    const converted = toShoppingIntentInput(content.value, context);
    if (!converted.ok) return rejectOutput(`invalid ${converted.path || 'answer'}`);

    const parsed = parseShoppingIntent(converted.input);
    if (!parsed.success) return rejectOutput(`invalid ${parsed.issues.map(issue => issue.path || 'answer').join(', ')}`);
    if (Object.keys(parsed.intent).length === 0) return {status: 'no_criteria', notices: converted.notices};

    const catalog = await searchCatalog(parsed.intent, {languageCode, currencyCode});
    if (catalog.status === 'error') return {status: 'unavailable', reason: 'catalog_error'};

    return {...catalog, intent: parsed.intent, notices: converted.notices};
}

function rejectOutput(detail: string): ShoppingAssistantResult {
    // Log field paths only, never the model's answer or the customer's text.
    console.error(`Shopping assistant rejected model output: ${detail}`);
    return {status: 'unavailable', reason: 'invalid_output'};
}
