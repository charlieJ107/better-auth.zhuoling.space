import Link from "next/link";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface HomeProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Language Switcher - Top Right Corner */}
      <div className="absolute top-4 right-4 z-30">
        <Suspense fallback={
          <Skeleton className="w-10 h-10" />
        }>
          <LanguageSwitcher currentLocale={locale} />
        </Suspense>
      </div>

      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {dict.pages.home.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {dict.pages.home.slogan}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dict.pages.home.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href={`/${locale}/login`} className="block">
              <Button className="w-full h-12 text-lg font-medium">
                {dict.common.login}
              </Button>
            </Link>
            <Link href={`/${locale}/register`} className="block">
              <Button variant="outline" className="w-full h-12 text-lg font-medium">
                {dict.common.register}
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <Footer locale={locale} />
        </div>
      </div>
    </div>
  );
}
