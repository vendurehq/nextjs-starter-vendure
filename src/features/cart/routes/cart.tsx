import {CartItems} from "@/features/cart/routes/cart-items";
import {OrderSummary} from "@/features/cart/routes/order-summary";
import {PromotionCode} from "@/features/cart/routes/promotion-code";
import {getRouteLocale} from "@/platform/i18n/server";
import {getActiveCurrencyCode} from "@/features/currency/currency-server";
import {cacheLife, cacheTag} from "next/cache";
import {query} from "@/platform/vendure/api";
import {GetActiveOrderQuery} from '@/features/cart/graphql';

export async function Cart() {
    "use cache: private"
    cacheLife('minutes');
    cacheTag('cart');

    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const {data} = await query(GetActiveOrderQuery, {}, {
        useAuthToken: true,
        languageCode: locale,
        currencyCode,
    });

    const activeOrder = data.activeOrder;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <CartItems activeOrder={activeOrder}/>

            <div className="lg:col-span-1">
                <OrderSummary activeOrder={activeOrder}/>
                <PromotionCode activeOrder={activeOrder}/>
            </div>
        </div>
    )
}
