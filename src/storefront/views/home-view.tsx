import {Suspense} from 'react';
import {FeaturedProducts} from '@/components/commerce/featured-products';
import {HomeHero} from '@/storefront/components/home-hero';
import {HomeFeatures} from '@/storefront/components/home-features';

export function HomeView() {
    return (
        <div className="min-h-screen">
            <HomeHero />
            <Suspense>
                <FeaturedProducts />
            </Suspense>
            <HomeFeatures />
        </div>
    );
}
