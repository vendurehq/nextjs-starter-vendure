import {getActiveChannel} from '@/platform/vendure/channel';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {CurrencyPicker} from './currency-picker';

// Intentionally dynamic (not cached) — reads the currency cookie via
// getActiveCurrencyCode() so the picker reflects the user's current selection.
export async function CurrencyPickerWrapper() {
    const channel = await getActiveChannel();
    const activeCurrency = await getActiveCurrencyCode();

    return (
        <CurrencyPicker
            availableCurrencyCodes={channel.availableCurrencyCodes}
            activeCurrencyCode={activeCurrency}
        />
    );
}
