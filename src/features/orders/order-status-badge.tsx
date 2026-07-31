import {Badge} from '@/components/ui/badge';
import {
    ShoppingCart,
    CreditCard,
    Clock,
    CheckCircle,
    Truck,
    PackageCheck,
    Package,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import {useTranslations} from 'next-intl';

const STATUS_CONFIG: Record<string, { color: string; icon: LucideIcon }> = {
    AddingItems: {color: 'bg-gray-100 text-gray-800', icon: ShoppingCart},
    ArrangingPayment: {color: 'bg-yellow-100 text-yellow-800', icon: CreditCard},
    PaymentAuthorized: {color: 'bg-blue-100 text-blue-800', icon: Clock},
    PaymentSettled: {color: 'bg-green-100 text-green-800', icon: CheckCircle},
    PartiallyShipped: {color: 'bg-indigo-100 text-indigo-800', icon: Package},
    Shipped: {color: 'bg-purple-100 text-purple-800', icon: Truck},
    PartiallyDelivered: {color: 'bg-cyan-100 text-cyan-800', icon: PackageCheck},
    Delivered: {color: 'bg-emerald-100 text-emerald-800', icon: PackageCheck},
    Cancelled: {color: 'bg-red-100 text-red-800', icon: XCircle},
};

interface OrderStatusBadgeProps {
    state: string;
}

export function OrderStatusBadge({state}: OrderStatusBadgeProps) {
    const t = useTranslations('OrderStatus');
    const config = STATUS_CONFIG[state] || {color: 'bg-gray-100 text-gray-800', icon: Clock};
    const Icon = config.icon;
    const label = state in STATUS_CONFIG ? t(state as 'AddingItems' | 'ArrangingPayment' | 'PaymentAuthorized' | 'PaymentSettled' | 'PartiallyShipped' | 'Shipped' | 'PartiallyDelivered' | 'Delivered' | 'Cancelled') : state;

    return (
        <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1"/>
            {label}
        </Badge>
    );
}
