'use client';

import { useChannel } from '@/providers/channel-provider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function CurrencyPicker() {
    const { channel, currencyCode, setCurrencyCode } = useChannel();

    return (
        <Select
            value={currencyCode}
            onValueChange={setCurrencyCode}
        >
            <SelectTrigger className="w-[100px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {channel.availableCurrencyCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                        {code}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
