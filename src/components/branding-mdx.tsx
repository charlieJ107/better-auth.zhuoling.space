'use client';

import { useParams } from 'next/navigation';
import { Locale, defaultLocale } from '@/lib/i18n';
import { getBrandingConfig } from '@/lib/branding';

export function BrandServiceDescriptionClient() {
    const params = useParams();
    const locale = (params?.locale as Locale) || defaultLocale;
    const branding = getBrandingConfig();
    return <>{branding.serviceDescription[locale]}</>;
}

