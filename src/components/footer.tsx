'use client';
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
    const { t } = useTranslation(locale);
    return (
        <footer className="pt-8 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex justify-center space-x-4 mb-2">
                <Link
                    href={`/${locale}/legal/terms`}
                    className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    {t('common.termsOfService')}
                </Link>
                <span>•</span>
                <Link
                    href={`/${locale}/legal/privacy`}
                    className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    {t('common.privacyPolicy')}
                </Link>
            </div>
            <p>© 2025 Zhuoling.Space. All rights reserved.</p>
        </footer>
    )
}