'use client';

import {useState, useEffect, useTransition} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {cn} from '@core/lib/utils';

export interface SearchInputProps {
    className?: string;
}

export function SearchInput({className}: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

    useEffect(() => {
        setSearchValue(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    };

    return (
        <form onSubmit={handleSubmit} className={cn("relative", className)}>
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
