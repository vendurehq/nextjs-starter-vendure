type Messages = Record<string, unknown>;
type MessageLoader = () => Promise<{default: Messages}>;

const loaders: Record<string, MessageLoader[]> = {
    en: [
        () => import('@/features/account/messages/en.json'),
        () => import('@/features/authentication/messages/en.json'),
        () => import('@/features/cart/messages/en.json'),
        () => import('@/features/checkout/messages/en.json'),
        () => import('@/features/orders/messages/en.json'),
        () => import('@/features/products/messages/en.json'),
        () => import('@/features/search/messages/en.json'),
        () => import('@/site/home/messages/en.json'),
        () => import('@/site/navigation/messages/en.json'),
        () => import('@/site/messages/en.json'),
    ],
    de: [
        () => import('@/features/account/messages/de.json'),
        () => import('@/features/authentication/messages/de.json'),
        () => import('@/features/cart/messages/de.json'),
        () => import('@/features/checkout/messages/de.json'),
        () => import('@/features/orders/messages/de.json'),
        () => import('@/features/products/messages/de.json'),
        () => import('@/features/search/messages/de.json'),
        () => import('@/site/home/messages/de.json'),
        () => import('@/site/navigation/messages/de.json'),
        () => import('@/site/messages/de.json'),
    ],
};

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
