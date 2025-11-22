'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Languages } from 'lucide-react';
import { useState } from 'react';
import { Locale } from '@/lib/i18n';
import { Route } from 'next';
import { locales } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

const languageNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文'
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: Locale) => {
    
    const pathParts = pathname.split('/');
    if (!locales.includes(pathParts[1] as Locale)) {
      pathParts[1] = currentLocale;
    }
    if (pathParts[1] === locale) {
      return;
    }
    pathParts[1] = locale;
    let newUrl =pathParts.join('/');
    if (searchParams.toString()) {
      newUrl += `?${searchParams.toString()}`;
    }
    router.push(newUrl as Route);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg"><Languages className="size-4" /></span>
          <span>{languageNames[currentLocale]}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[120px]">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md flex items-center gap-2 ${currentLocale === locale
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                <span>{languageNames[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
