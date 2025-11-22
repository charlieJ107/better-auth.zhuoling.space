import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import Logo from "@/components/logo";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

interface LogoutProps {
    params: Promise<{ locale: Locale }>;
}

export default async function Logout({ params }: LogoutProps) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect(`/${locale}/login`);   // User is not logged in, redirect to login page
    }
    const response = await auth.api.signOut({
        headers: await headers(),
    });
    if (response.success) {
        redirect(`/${locale}/logout/success`);
    } else {
        redirect(`/${locale}/logout/error`);
    }
    // A loading state should be shown here
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex items-center justify-center">
                <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
                    <Logo className="size-6" />
                    {dict.common.appName}
                </Link>
            </div>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">{dict.pages.logout.title}</CardTitle>
                        <CardDescription>{dict.pages.logout.description}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}