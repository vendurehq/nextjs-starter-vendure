import Link from 'next/link';
import {Package, User, LogOut} from 'lucide-react';
import {redirect} from 'next/navigation';
import {getActiveCustomer} from '@/lib/vendure/actions';

const navItems = [
    {href: '/account/orders', label: 'Orders', icon: Package},
    {href: '/account/profile', label: 'Profile', icon: User},
];

export default async function AccountLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const customer = await getActiveCustomer();

    if (!customer) {
        redirect('/sign-in');
    }

    return (
        <div className="container mx-auto px-4 py-30">
            <div className="flex gap-8">
                <aside className="w-64 shrink-0">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <item.icon className="h-5 w-5"/>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
