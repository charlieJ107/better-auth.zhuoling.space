import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountInfoLoading() {
    return (
        <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
            <div className="mb-8">
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Form Skeleton */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-40" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-56" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name and Username Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <div className="relative">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <Skeleton className="h-3 w-48" />
                            </div>

                            {/* Phone Number Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
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

                {/* Account Status Skeleton */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-36" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    {i < 3 && <Skeleton className="h-px w-full" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

