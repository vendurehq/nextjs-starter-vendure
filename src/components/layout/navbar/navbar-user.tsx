import {getRouteLocale} from '@/i18n/server';
import {User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import {LoginButton} from "@/components/layout/navbar/login-button";
import {getActiveCustomer} from "@/lib/vendure/actions";
import {getTranslations} from 'next-intl/server';


export async function NavbarUser() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});
    const customer = await getActiveCustomer()

    if (!customer) {
        return (
            <Button render={<LoginButton isLoggedIn={false} />} variant="ghost" />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" />}>
                <User className="h-5 w-5"/>
                {t('greeting', {name: customer.firstName})}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem render={<Link href="/account/profile" />}>{t('profile')}</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/orders" />}>{t('orders')}</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem render={<LoginButton isLoggedIn={true} />} nativeButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
