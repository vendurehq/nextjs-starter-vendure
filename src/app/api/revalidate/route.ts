import {revalidateTag} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from '@/i18n/routing';
import {getActiveChannelCached} from '@/lib/vendure/cached';

// Base tags that vary only by locale.
const LOCALE_ONLY_BASE_TAGS = ['collections', 'countries'] as const;

// Base tags that vary by locale AND currency.
const CURRENCY_DEPENDENT_BASE_TAGS = ['featured'] as const;

// Dynamic tag patterns that vary only by locale.
// IMPORTANT: checked before currency-dependent patterns so that
// `collection-meta-{slug}` is not misclassified as `collection-{slug}`.
const LOCALE_ONLY_DYNAMIC_PATTERNS = [
    /^collection-meta-.+$/,
    /^footer$/,
    /^navbar-collections$/,
    /^mobile-nav$/,
];

// Dynamic tag patterns that vary by locale AND currency.
const CURRENCY_DEPENDENT_DYNAMIC_PATTERNS = [
    /^product-.+$/,
    /^collection-.+$/,
    /^related-products-.+$/,
];

type TagClassification = 'locale-only' | 'currency-dependent' | 'invalid';

function classifyTag(tag: string): TagClassification {
    if ((LOCALE_ONLY_BASE_TAGS as readonly string[]).includes(tag)) {
        return 'locale-only';
    }
    if ((CURRENCY_DEPENDENT_BASE_TAGS as readonly string[]).includes(tag)) {
        return 'currency-dependent';
    }
    if (LOCALE_ONLY_DYNAMIC_PATTERNS.some(p => p.test(tag))) {
        return 'locale-only';
    }
    if (CURRENCY_DEPENDENT_DYNAMIC_PATTERNS.some(p => p.test(tag))) {
        return 'currency-dependent';
    }
    return 'invalid';
}

export async function POST(request: NextRequest) {
    // Verify the secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REVALIDATION_SECRET;

    if (!expectedToken) {
        console.error('REVALIDATION_SECRET environment variable not set');
        return NextResponse.json(
            {error: 'Server configuration error'},
            {status: 500}
        );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        );
    }

    try {
        const body = await request.json();
        const {tags} = body;

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return NextResponse.json(
                {error: 'Missing or invalid "tags" array in request body'},
                {status: 400}
            );
        }

        // Currencies are loaded lazily — only fetch if a currency-dependent tag is submitted.
        let cachedCurrencies: string[] | null = null;
        const getCurrencies = async (): Promise<string[]> => {
            if (cachedCurrencies) return cachedCurrencies;
            const channel = await getActiveChannelCached();
            cachedCurrencies = channel.availableCurrencyCodes as string[];
            return cachedCurrencies;
        };

        const results: {tag: string; success: boolean; error?: string}[] = [];

        for (const tag of tags) {
            if (typeof tag !== 'string') {
                results.push({tag: String(tag), success: false, error: 'Invalid tag type'});
                continue;
            }

            const classification = classifyTag(tag);

            if (classification === 'invalid') {
                results.push({tag, success: false, error: 'Unknown tag'});
                continue;
            }

            const expanded: string[] = [];
            if (classification === 'locale-only') {
                for (const locale of routing.locales) {
                    expanded.push(`${tag}-${locale}`);
                }
            } else {
                const currencies = await getCurrencies();
                for (const locale of routing.locales) {
                    for (const currency of currencies) {
                        expanded.push(`${tag}-${locale}-${currency}`);
                    }
                }
            }

            for (const fullTag of expanded) {
                try {
                    revalidateTag(fullTag, {expire: 0});
                    results.push({tag: fullTag, success: true});
                } catch {
                    results.push({tag: fullTag, success: false, error: 'Revalidation failed'});
                }
            }
        }

        const allSuccessful = results.every(r => r.success);

        return NextResponse.json(
            {
                revalidated: allSuccessful,
                results,
                timestamp: Date.now(),
            },
            {status: allSuccessful ? 200 : 207} // 207 = Multi-Status
        );
    } catch {
        return NextResponse.json(
            {error: 'Invalid JSON body'},
            {status: 400}
        );
    }
}
