import {ShoppingCart, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {query} from "@/lib/vendure/api";
import {GetActiveCustomerQuery, GetActiveOrderQuery} from "@/lib/vendure/queries";
import {SearchInput} from "@/components/search-input";
import {getTopCollections} from "@/lib/collections";
import {CurrencyPicker} from "@/components/currency-picker";
import {LanguagePicker} from "@/components/language-picker";
import {Link} from "@/i18n/navigation";

export async function Navbar({locale}: { locale: string }) {

    const [collections, customerResult, orderResult] = await Promise.all([
        getTopCollections(locale),
        query(GetActiveCustomerQuery, undefined, {useAuthToken: true}),
        query(GetActiveOrderQuery, undefined, {useAuthToken: true, tags: ['cart']}),
    ]);

    const customer = customerResult.data.activeCustomer;
    const cartItemCount = orderResult.data.activeOrder?.totalQuantity || 0;

    return (
        <header className="border-b border-border w-full fixed top-0 left-0 right-0 bg-background z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold">
                            LOGO
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            {collections.map((collection) => (
                                <Link
                                    key={collection.slug}
                                    href={`/collection/${collection.slug}`}
                                    className="text-sm font-medium hover:text-primary transition-colors"
                                >
                                    {collection.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side: Search, Cart, User */}
                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="hidden lg:flex items-center">
                            <SearchInput/>
                        </div>

                        {/* Language Picker */}
                        <div className="hidden md:block">
                            <LanguagePicker/>
                        </div>

                        {/* Currency Picker */}
                        <div className="hidden md:block">
                            <CurrencyPicker/>
                        </div>

                        {/* Cart Button */}
                        <Button variant="ghost" size="icon" asChild className="relative">
                            <Link href="/cart">
                                <ShoppingCart className="h-5 w-5"/>
                                {cartItemCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                                <span className="sr-only">Shopping Cart</span>
                            </Link>
                        </Button>

                        {/* User Dropdown / Sign In */}
                        {customer ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5"/>
                                        <span className="sr-only">User menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        Hi, {customer.firstName}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/orders">Orders</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem>
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" asChild>
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}