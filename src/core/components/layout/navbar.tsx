import Image from "next/image";
import Link from "next/link";
import {NavbarCollections} from '@core/components/layout/navbar/navbar-collections';
import {NavbarCart} from '@core/components/layout/navbar/navbar-cart';
import {NavbarUser} from '@core/components/layout/navbar/navbar-user';
import {ThemeSwitcher} from '@core/components/layout/navbar/theme-switcher';
import {Suspense} from "react";
import {SearchInput} from '@core/components/layout/search-input';
import {NavbarUserSkeleton} from '@core/components/shared/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@core/components/shared/skeletons/search-input-skeleton';

export interface NavbarProps {}

export function Navbar(_props: NavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold">
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-6 w-auto dark:invert" />
                        </Link>
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
                        <ThemeSwitcher />
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