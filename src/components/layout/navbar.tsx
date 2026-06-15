import {NavigationLink} from '@/components/shared/navigation-link';
import {NavbarCollections} from '@/components/layout/navbar/navbar-collections';
import {NavbarCart} from '@/components/layout/navbar/navbar-cart';
import {NavbarUser} from '@/components/layout/navbar/navbar-user';
import {ThemeSwitcher} from '@/components/layout/navbar/theme-switcher';
import {LanguagePicker} from '@/components/layout/navbar/language-picker';
import {CurrencyPickerWrapper} from '@/components/layout/navbar/currency-picker-wrapper';
import {MobileNavWrapper} from '@/components/layout/navbar/mobile-nav-wrapper';
import {Suspense} from "react";
import {SearchInput} from '@/components/layout/search-input';
import {NavbarUserSkeleton} from '@/components/shared/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/components/shared/skeletons/search-input-skeleton';
import {StorefrontLogo} from '@/storefront/components/logo';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/80">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Suspense>
                            <MobileNavWrapper />
                        </Suspense>
                        <NavigationLink href="/" className="text-xl font-bold">
                            <StorefrontLogo />
                        </NavigationLink>
                        <nav className="hidden md:flex items-center gap-6">
                            <Suspense>
                                <NavbarCollections/>
                            </Suspense>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput/>
                            </Suspense>
                        </div>
                        <Suspense>
                            <LanguagePicker />
                        </Suspense>
                        <Suspense>
                            <CurrencyPickerWrapper />
                        </Suspense>
                        <Suspense>
                            <ThemeSwitcher />
                        </Suspense>
                        <Suspense>
                            <NavbarCart/>
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser/>
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
}
