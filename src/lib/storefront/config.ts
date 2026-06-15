import { storefrontConfig } from '@/storefront/config';
import { defaultStorefrontConfig } from './defaults';
import type { DeepPartial, StorefrontConfig } from './schema';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeConfig<T>(
    defaults: T,
    overrides: DeepPartial<T> | undefined
): T {
    if (!overrides) {
        return defaults;
    }

    if (!isRecord(defaults) || !isRecord(overrides)) {
        return overrides as T;
    }

    const result: Record<string, unknown> = {...defaults};

    for (const [key, overrideValue] of Object.entries(overrides)) {
        if (overrideValue === undefined) {
            continue;
        }

        const defaultValue = result[key];
        result[key] = isRecord(defaultValue) && isRecord(overrideValue)
            ? mergeConfig(defaultValue, overrideValue as DeepPartial<typeof defaultValue>)
            : overrideValue;
    }

    return result as T;
}

export const storefront: StorefrontConfig = mergeConfig(
    defaultStorefrontConfig,
    storefrontConfig
);
