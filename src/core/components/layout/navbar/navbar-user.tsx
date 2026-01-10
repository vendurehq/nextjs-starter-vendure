import {User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from "next/link";
import {LoginButton} from "@core/components/layout/navbar/login-button";
import {getActiveCustomer} from "@/lib/vendure/actions";


export async function NavbarUser() {
    const customer = await getActiveCustomer()

    if (!customer) {
        return (
            <Button variant="ghost" asChild>
                <LoginButton isLoggedIn={false}/>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    <User className="h-5 w-5"/>
                    Hi, {customer.firstName}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <Link href="/account/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem asChild>
                    <LoginButton isLoggedIn={true}/>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
