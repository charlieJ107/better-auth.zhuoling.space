import { Locale, locales } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/language-switcher";

interface LegalLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LegalLayout({ children, params }: LegalLayoutProps) {
    const { locale } = await params;
    if (!locales.includes(locale as Locale)) {
        return notFound();
    }
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
            {/* Language Switcher - Top Right Corner */}
            <div className="absolute top-4 right-4 z-30">
                <Suspense fallback={
                    <Skeleton className="w-10 h-10" />
                }>
                    <LanguageSwitcher currentLocale={locale as Locale} />
                </Suspense>
            </div>
            <div className="flex w-full max-w-4xl flex-col gap-6">
                {children}
            </div>
        </div>
    )
}