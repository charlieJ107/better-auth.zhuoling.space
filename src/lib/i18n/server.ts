import 'server-only';

import { NextRequest } from 'next/server';
import { Locale, defaultLocale, locales } from './common';
import { replaceTemplateInObject } from './template';


export const dictionaries = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    zh: () => import('./dictionaries/zh.json').then((module) => module.default),
};


export async function getDictionary(locale: Locale) {
    const dict = await dictionaries[locale]();
    // Replace template variables in the dictionary
    return replaceTemplateInObject(dict) as typeof dict;
}

export function getLocale(request: NextRequest) {
    const { pathname } = request.nextUrl
    const locale = pathname.split('/')[1]
    if (locale && locales.includes(locale as Locale)) {
        return locale as Locale
    }
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
        const languages = acceptLanguage.split(',')
        for (const lang of languages) {
            const [code] = lang.trim().split(';q=')
            if (code && locales.includes(code as Locale)) {
                return code as Locale
            }
        }
    }
    return defaultLocale
}

export function getLocaleFromPathname(pathname: string): Locale {
    const segments = pathname.split('/');
    const locale = segments[1] as Locale;
    
    if (locales.includes(locale)) {
        return locale;
    }
    
    return defaultLocale;
}

export function getPathnameWithoutLocale(pathname: string): string {
    const segments = pathname.split('/');
    const locale = segments[1] as Locale;
    
    if (locales.includes(locale)) {
        return '/' + segments.slice(2).join('/');
    }
    
    return pathname;
}

export function getLocalizedPathname(pathname: string, locale: Locale): string {
    const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
    
    if (pathnameWithoutLocale === '/') {
        return `/${locale}`;
    }
    
    return `/${locale}${pathnameWithoutLocale}`;
}

export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
}