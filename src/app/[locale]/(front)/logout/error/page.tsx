import { getDictionary } from "@/lib/i18n/server";
import { Locale } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Logo from "@/components/logo";

interface LogoutErrorProps {
    params: Promise<{ locale: Locale }>;
}

export default async function LogoutError({ params }: LogoutErrorProps) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session?.user) {
        // Logged in user should be logged out first before redirecting to this logout error page
        redirect(`/${locale}/logout`);
    }   // User is not logged in, redirect to login page
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex items-center justify-center">
                <Link href={`/${locale}`} >
                    <Logo className="flex items-center gap-2 font-medium"/>
                </Link>
            </div>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">{dict.pages.logout.title}</CardTitle>
                        <CardDescription>{dict.pages.logout.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <p>{dict.pages.logout.loggedOutUnsuccessfully}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href={`/${locale}/logout`}>{dict.pages.logout.tryAgain}</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}