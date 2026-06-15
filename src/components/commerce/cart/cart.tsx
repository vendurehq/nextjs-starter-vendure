import {CartItems} from "@/components/commerce/cart/cart-items";
import {OrderSummary} from "@/components/commerce/cart/order-summary";
import {PromotionCode} from "@/components/commerce/cart/promotion-code";
import {getRouteLocale} from "@/i18n/server";
import {getActiveCurrencyCode} from "@/lib/currency-server";
import {cacheLife, cacheTag} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetActiveOrderQuery} from "@/lib/vendure/queries";

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

    // Handle empty cart case
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
