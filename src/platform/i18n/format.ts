import {toIntlLocale} from '@/platform/i18n/locale-utils';

type DateFormat = 'short' | 'long';

/**
 * Format a date string
 * @param dateString ISO date string
 * @param format 'short' (Jan 15, 2024) or 'long' (January 15, 2024)
 * @param locale App locale code (e.g. 'en', 'de')
 */
export function formatDate(dateString: string, format: DateFormat = 'short', locale: string = 'en'): string {
    const options: Intl.DateTimeFormatOptions = format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return new Date(dateString).toLocaleDateString(toIntlLocale(locale), options);
}
