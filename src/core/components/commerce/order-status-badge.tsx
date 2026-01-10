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

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: LucideIcon }> = {
    AddingItems: {color: 'bg-gray-100 text-gray-800', label: 'Adding Items', icon: ShoppingCart},
    ArrangingPayment: {color: 'bg-yellow-100 text-yellow-800', label: 'Arranging Payment', icon: CreditCard},
    PaymentAuthorized: {color: 'bg-blue-100 text-blue-800', label: 'Payment Authorized', icon: Clock},
    PaymentSettled: {color: 'bg-green-100 text-green-800', label: 'Payment Settled', icon: CheckCircle},
    PartiallyShipped: {color: 'bg-indigo-100 text-indigo-800', label: 'Partially Shipped', icon: Package},
    Shipped: {color: 'bg-purple-100 text-purple-800', label: 'Shipped', icon: Truck},
    PartiallyDelivered: {color: 'bg-cyan-100 text-cyan-800', label: 'Partially Delivered', icon: PackageCheck},
    Delivered: {color: 'bg-emerald-100 text-emerald-800', label: 'Delivered', icon: PackageCheck},
    Cancelled: {color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle},
};

interface OrderStatusBadgeProps {
    state: string;
}

export function OrderStatusBadge({state}: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[state] || {color: 'bg-gray-100 text-gray-800', label: state, icon: Clock};
    const Icon = config.icon;

    return (
        <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1"/>
            {config.label}
        </Badge>
    );
}
