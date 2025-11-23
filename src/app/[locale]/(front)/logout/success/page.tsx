import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/logo";

interface LogoutSuccessProps {
    params: Promise<{ locale: Locale }>;
}

export default async function LogoutSuccess({ params }: LogoutSuccessProps) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session?.user) {
        // Logged in user should be logged out first before redirecting to this logout success page
        redirect(`/${locale}/logout`);
    }
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex items-center justify-center">
                <Link href={`/${locale}`} >
                    <Logo className="flex items-center gap-2 font-medium" />
                </Link>
            </div>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">{dict.pages.logout.title}</CardTitle>
                        <CardDescription>{dict.pages.logout.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 justify-center items-center">
                        <div className="flex flex-col gap-2">
                            <p>{dict.pages.logout.loggedOutSuccessfully}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href={`/${locale}/login`} className={buttonVariants({ variant: "default" })}>{dict.pages.logout.loginAgain}</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

