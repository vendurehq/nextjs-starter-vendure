import { Link } from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Lock} from 'lucide-react';
import {Price} from '@/components/commerce/price';
import {getTranslations} from 'next-intl/server';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    discounts?: Array<{
        description: string;
        amountWithTax: number;
    }> | null;
};

export async function OrderSummary({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = await getTranslations('Cart');
    return (
        <div className="border rounded-xl p-6 bg-card sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>
                        <Price value={activeOrder.subTotalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
                {activeOrder.discounts && activeOrder.discounts.length > 0 && (
                    <>
                        {activeOrder.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-sm text-green-600">
                                <span>{discount.description}</span>
                                <span>
                                    <Price value={discount.amountWithTax} currencyCode={activeOrder.currencyCode}/>
                                </span>
                            </div>
                        ))}
                    </>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('shipping')}</span>
                    <span>
                        {activeOrder.shippingWithTax > 0
                            ? <Price value={activeOrder.shippingWithTax} currencyCode={activeOrder.currencyCode}/>
                            : t('calculatedAtCheckout')}
                    </span>
                </div>
            </div>

            <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-baseline text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-2xl">
                        <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode}/>
                    </span>
                </div>
            </div>

            <Button render={<Link href="/checkout" />} nativeButton={false} className="w-full" size="lg">{t('proceedToCheckout')}</Button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{t('secureCheckout')}</span>
            </div>

            <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="w-full mt-3">{t('continueShopping')}</Button>
        </div>
    );
}
