import { Skeleton } from '@/components/ui/skeleton';

export function NavbarUserSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
        </div>
    );
}
