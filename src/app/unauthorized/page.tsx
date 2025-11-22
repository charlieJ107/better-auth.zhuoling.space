import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Route } from "next";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
                    <p className="mt-2 text-gray-600">
                        You don&apos;t have permission to access this page.
                    </p>
                </div>
                
                <Alert variant="destructive">
                    <CircleAlert className="h-4 w-4" />
                    <AlertTitle>Unauthorized Access</AlertTitle>
                    <AlertDescription>
                        This page is restricted to administrators only. Please contact your system administrator if you believe this is an error.
                    </AlertDescription>
                </Alert>
                
                <div className="text-center">
                    <Button asChild>
                        <Link href={`/` as Route}>
                            Return to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
