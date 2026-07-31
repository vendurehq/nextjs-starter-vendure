'use client';

import {useSelectedLayoutSegment} from 'next/navigation';
import {ComponentProps} from 'react';
import { Link } from '@/platform/i18n/navigation';
import {
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {cn} from '@/lib/utils';

export function NavbarLink({href, ...rest}: ComponentProps<typeof Link>) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
    const isActive = pathname === href;

    return (
        <NavigationMenuLink render={<Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(navigationMenuTriggerStyle(), 'bg-transparent')}
                href={href}
                {...rest}
            />} active={isActive} />
    );
}