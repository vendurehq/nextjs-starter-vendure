/**
 * Format a price value in USD
 * @param price Price in cents (smallest currency unit)
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price / 100);
}

type DateFormat = 'short' | 'long';

/**
 * Format a date string
 * @param dateString ISO date string
 * @param format 'short' (Jan 15, 2024) or 'long' (January 15, 2024)
 */
export function formatDate(dateString: string, format: DateFormat = 'short'): string {
    const options: Intl.DateTimeFormatOptions = format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return new Date(dateString).toLocaleDateString('en-US', options);
}
