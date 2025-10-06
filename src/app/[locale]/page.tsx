import {query} from "@/lib/vendure/api";
import {GetCollectionProductsQuery} from "@/lib/vendure/queries";
import {HeroSection} from "@/components/hero-section";
import {ProductCarousel} from "@/components/product-carousel";
import {routing} from "@/i18n/routing";

export async function generateStaticParams() {
    return routing.locales.map((locale) => ({
        locale
    }))
}

export default async function Home() {
    // Fetch featured products from a specific collection
    // Replace 'featured' with your actual collection slug
    const result = await query(GetCollectionProductsQuery, {
        slug: "electronics",
        input: {
            collectionSlug: "electronics",
            take: 12,
            skip: 0,
            groupByProduct: true
        }
    });

    const products = result.data.search.items;

    return (
        <div className="min-h-screen">
            <HeroSection/>

            {products.length > 0 && (
                <ProductCarousel
                    title="Featured Products"
                    products={products}
                />
            )}

            {/* You can add more sections here */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <div
                                className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">High Quality</h3>
                            <p className="text-muted-foreground">Premium products carefully selected for you</p>
                        </div>
                        <div className="space-y-3">
                            <div
                                className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Best Prices</h3>
                            <p className="text-muted-foreground">Competitive pricing on all our products</p>
                        </div>
                        <div className="space-y-3">
                            <div
                                className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Fast Delivery</h3>
                            <p className="text-muted-foreground">Quick and reliable shipping worldwide</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
