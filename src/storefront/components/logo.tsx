import Image from 'next/image';
import {storefront} from '@/lib/storefront/config';
import {cn} from '@/lib/utils';

interface StorefrontLogoProps {
    className?: string;
}

export function StorefrontLogo({className}: StorefrontLogoProps) {
    const {logo} = storefront.site;

    return (
        <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className={cn('h-6 w-auto dark:invert', className)}
        />
    );
}
