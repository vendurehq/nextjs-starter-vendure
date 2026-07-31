import {accountMessageLoaders} from '@/features/account/messages';
import {authenticationMessageLoaders} from '@/features/authentication/messages';
import {cartMessageLoaders} from '@/features/cart/messages';
import {checkoutMessageLoaders} from '@/features/checkout/messages';
import {collectionsMessageLoaders} from '@/features/collections/messages';
import {ordersMessageLoaders} from '@/features/orders/messages';
import {productsMessageLoaders} from '@/features/products/messages';
import {searchMessageLoaders} from '@/features/search/messages';
import {
    platformMessageLoaders,
    type MessageLoader,
    type MessageLoaders,
    type Messages,
} from '@/platform/i18n/messages';
import {homeMessageLoaders} from '@/site/home/messages';
import {navigationMessageLoaders} from '@/site/navigation/messages';
import {siteMessageLoaders} from '@/site/messages';

const registrations: MessageLoaders[] = [
    accountMessageLoaders,
    authenticationMessageLoaders,
    cartMessageLoaders,
    checkoutMessageLoaders,
    collectionsMessageLoaders,
    ordersMessageLoaders,
    productsMessageLoaders,
    searchMessageLoaders,
    platformMessageLoaders,
    homeMessageLoaders,
    navigationMessageLoaders,
    siteMessageLoaders,
];

const loaders: Record<string, MessageLoader[]> = {};
for (const registration of registrations) {
    for (const [locale, load] of Object.entries(registration)) {
        (loaders[locale] ??= []).push(load);
    }
}

export async function loadMessages(locale: string): Promise<Messages> {
    const localeLoaders = loaders[locale];
    if (!localeLoaders) throw new Error(`No messages configured for locale "${locale}"`);

    const modules = await Promise.all(localeLoaders.map(load => load()));
    const messages: Messages = {};
    for (const module of modules) {
        for (const [namespace, value] of Object.entries(module.default)) {
            if (namespace in messages) {
                throw new Error(`Duplicate message namespace "${namespace}" for locale "${locale}"`);
            }
            messages[namespace] = value;
        }
    }
    return messages;
}
