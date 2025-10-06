'use client';

import {useState, useTransition} from 'react';
import {useSearchParams} from 'next/navigation';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {useRouter} from "@/i18n/navigation";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        startTransition(() => {
            router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 w-64"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={isPending}
            />
        </form>
    );
}
