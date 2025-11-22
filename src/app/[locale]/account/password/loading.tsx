import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPasswordLoading() {
    return (
        <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
            <div className="mb-8">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Password Form Skeleton */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-48" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-64" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current Password Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <div className="relative">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* New Password Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <div className="relative">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <Skeleton className="h-3 w-56" />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <div className="relative">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Separator */}
                            <Skeleton className="h-px w-full" />

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Tips Skeleton */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Skeleton className="w-2 h-2 rounded-full mt-2" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-36" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}