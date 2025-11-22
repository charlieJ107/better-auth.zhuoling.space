import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountLoading() {
    return (
        <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
            <div className="mb-8">
                <Skeleton className="h-9 w-80 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* User Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-32" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-48" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                {i < 4 && <Skeleton className="h-px w-full" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Security Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-40" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-52" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                {i < 3 && <Skeleton className="h-px w-full" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-36" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-48" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-32" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

