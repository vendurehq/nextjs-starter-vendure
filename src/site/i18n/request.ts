import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/platform/i18n/routing';
import {loadMessages} from './messages';

export default getRequestConfig(async ({requestLocale}) => {
    const requested = (await requestLocale) as string;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
    return {
        locale,
        messages: await loadMessages(locale),
    };
});
