'use client';


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {useSearchParams} from "next/navigation";
import {usePathname, useRouter} from '@/platform/i18n/navigation';
import {useTranslations} from 'next-intl';

export function SortDropdown() {
    const t = useTranslations('Sort');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const sortOptions = [
        {value: 'name-asc', label: t('nameAsc')},
        {value: 'name-desc', label: t('nameDesc')},
        {value: 'price-asc', label: t('priceAsc')},
        {value: 'price-desc', label: t('priceDesc')},
    ];

    const currentSort = searchParams.get('sort') || 'name-asc';

    const handleSortChange = (value: string | null) => {
        if (!value) return;
        const params = new URLSearchParams(searchParams);
        params.set('sort', value);
        params.delete('page'); // Reset to page 1 when sort changes
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange} items={sortOptions}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('placeholder')}/>
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
