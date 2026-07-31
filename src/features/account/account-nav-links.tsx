'use client';

import { Link, usePathname } from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';
import {Package, User, MapPin} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';

const iconMap: Record<string, LucideIcon> = {
    Package,
    MapPin,
    User,
};

interface NavItem {
    href: string;
    labelKey: string;
    icon: string;
}

interface AccountNavLinksProps {
    items: NavItem[];
    layout: 'horizontal' | 'vertical';
}

export function AccountNavLinks({items, layout}: AccountNavLinksProps) {
    const pathname = usePathname();
    const t = useTranslations('Account');

    if (layout === 'horizontal') {
        return (
            <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px">
                {items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = iconMap[item.icon];
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                                isActive
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {t(item.labelKey)}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    return (
        <nav className="space-y-1">
            {items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = iconMap[item.icon];
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                            isActive
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        {Icon && <Icon className="h-5 w-5" />}
                        {t(item.labelKey)}
                    </Link>
                );
            })}
        </nav>
    );
}
