import {revalidateTag} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from '@/i18n/routing';
import {getActiveChannelCached} from '@/lib/vendure/cached';

type TagKind = 'locale-only' | 'currency-dependent';

// Order matters: `collection-meta-` must precede `collection-` so the meta
// pattern isn't shadowed by the broader collection pattern.
const TAG_RULES: ReadonlyArray<{match: string | RegExp; kind: TagKind}> = [
    {match: 'collections', kind: 'locale-only'},
    {match: 'countries', kind: 'locale-only'},
    {match: 'featured', kind: 'currency-dependent'},
    {match: /^collection-meta-.+$/, kind: 'locale-only'},
    {match: /^footer$/, kind: 'locale-only'},
    {match: /^navbar-collections$/, kind: 'locale-only'},
    {match: /^mobile-nav$/, kind: 'locale-only'},
    {match: /^product-.+$/, kind: 'currency-dependent'},
    {match: /^collection-.+$/, kind: 'currency-dependent'},
    {match: /^related-products-.+$/, kind: 'currency-dependent'},
];

const MAX_TAGS_PER_REQUEST = 100;

function classifyTag(tag: string): TagKind | null {
    const rule = TAG_RULES.find(r =>
        typeof r.match === 'string' ? r.match === tag : r.match.test(tag)
    );
    return rule?.kind ?? null;
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

        if (tags.length > MAX_TAGS_PER_REQUEST) {
            return NextResponse.json(
                {error: `Too many tags (max ${MAX_TAGS_PER_REQUEST})`},
                {status: 400}
            );
        }

        let currencies: string[] | undefined;
        const results: {tag: string; success: boolean; error?: string}[] = [];

        for (const tag of tags) {
            if (typeof tag !== 'string') {
                results.push({tag: String(tag), success: false, error: 'Invalid tag type'});
                continue;
            }

            const kind = classifyTag(tag);

            if (kind === null) {
                results.push({tag, success: false, error: 'Unknown tag'});
                continue;
            }

            const expanded: string[] = [];
            if (kind === 'locale-only') {
                for (const locale of routing.locales) {
                    expanded.push(`${tag}-${locale}`);
                }
            } else {
                currencies ??= (await getActiveChannelCached()).availableCurrencyCodes as string[];
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
