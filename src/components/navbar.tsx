import {NavbarLogo} from '@/components/navbar/navbar-logo';
import {NavbarCollections} from '@/components/navbar/navbar-collections';
import {NavbarCart} from '@/components/navbar/navbar-cart';
import {NavbarUser} from '@/components/navbar/navbar-user';
import {Suspense} from "react";
import {SearchInput} from '@/components/search-input';
import {NavbarUserSkeleton} from '@/components/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/components/skeletons/search-input-skeleton';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <NavbarLogo/>
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