import {CartItems} from "@/app/cart/cart-items";
import {OrderSummary} from "@/app/cart/order-summary";
import {PromotionCode} from "@/app/cart/promotion-code";
import {query} from "@core/lib/vendure/api";
import {GetActiveOrderQuery} from "@core/lib/vendure/queries";

export async function Cart() {
    "use cache: private"

    const {data} = await query(GetActiveOrderQuery, {}, {
        useAuthToken: true,
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