import {getTopCollections} from '@/features/collections/data';
import {searchCatalog} from './catalog-search';
import {
    runShoppingAssistant,
    type ShoppingAssistantDependencies,
    type ShoppingAssistantOptions,
    type ShoppingAssistantResult,
} from './assistant-flow';
// The language model provider. Any StructuredCompletionProvider can replace it.
import {isOpenRouterConfigured, requestOpenRouterCompletion} from './openrouter';

export type {ShoppingAssistantOptions, ShoppingAssistantResult} from './assistant-flow';

const dependencies: ShoppingAssistantDependencies = {
    completeStructured: requestOpenRouterCompletion,
    loadCollectionSlugs: async languageCode =>
        (await getTopCollections(languageCode)).map(collection => collection.slug),
    searchCatalog,
};

/** Whether the language model provider is configured, so the assistant can be offered to shoppers. */
export function isShoppingAssistantEnabled(): boolean {
    return isOpenRouterConfigured();
}

/**
 * Answer a natural-language shopping request with real Vendure products.
 * The language model only proposes a ShoppingIntent; Vendure supplies every product.
 */
export function findProductsForRequest(text: string, options: ShoppingAssistantOptions): Promise<ShoppingAssistantResult> {
    return runShoppingAssistant(text, options, dependencies);
}
