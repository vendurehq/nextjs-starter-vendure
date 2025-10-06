'use client';

import { useChannel } from '@/providers/channel-provider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function LanguagePicker() {
    const { channel, languageCode, setLanguageCode } = useChannel();

    return (
        <Select
            value={languageCode}
            onValueChange={setLanguageCode}
        >
            <SelectTrigger className="w-[100px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {channel.availableLanguageCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                        {code.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
