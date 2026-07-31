import type {MessageLoaders} from '@/platform/i18n/messages';

export const cartMessageLoaders: MessageLoaders = {
    en: () => import('./messages/en.json'),
    de: () => import('./messages/de.json'),
};
