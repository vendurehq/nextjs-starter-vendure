import { query } from '@/lib/vendure/api';
import { GetProductDetailQuery } from '@/lib/vendure/queries';
import { ProductImageCarousel } from '@/components/product-image-carousel';
import { ProductInfo } from '@/components/product-info';
import { notFound } from 'next/navigation';

interface ProductDetailPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;

    const result = await query(GetProductDetailQuery, { slug });
    const product = result.data.product;

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Image Carousel */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <ProductImageCarousel images={product.assets} />
                </div>

                {/* Right Column: Product Info */}
                <div>
                    <ProductInfo product={product} searchParams={searchParamsResolved} />
                </div>
            </div>
        </div>
    );
}
