export type Messages = Record<string, unknown>;
export type MessageLoader = () => Promise<{default: Messages}>;
export type MessageLoaders = Record<string, MessageLoader>;

export const platformMessageLoaders: MessageLoaders = {
    en: () => import('./messages/en.json'),
    de: () => import('./messages/de.json'),
};
