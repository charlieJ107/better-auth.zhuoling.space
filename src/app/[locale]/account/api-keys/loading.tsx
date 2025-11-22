import { Skeleton } from "@/components/ui/skeleton";

export default function ApiKeysLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}