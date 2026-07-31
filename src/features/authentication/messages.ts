import type {MessageLoaders} from '@/platform/i18n/messages';

export const authenticationMessageLoaders: MessageLoaders = {
    en: () => import('./messages/en.json'),
    de: () => import('./messages/de.json'),
};
