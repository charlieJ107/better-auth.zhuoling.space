'use client';

import { useParams } from 'next/navigation';
import { Locale } from './common';
import en from './dictionaries/en.json';
import zh from './dictionaries/zh.json';
import { replaceTemplate, replaceTemplateInObject } from './template';
import { useMemo } from 'react';

const dictionaries = {
  en: en,
  zh: zh,
};

export function useTranslation(locale: Locale) {
  // Replace template variables in the dictionary once
  const dict = useMemo(() => {
    return replaceTemplateInObject(dictionaries[locale]);
  }, [locale]);

  const t = (key: string): string => {
    if (!dict) return key;

    const keys = key.split('.');
    let value: unknown = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    // If the value is a string, it may still contain template variables
    // Replace them in case they weren't replaced during dictionary processing
    if (typeof value === 'string') {
      return replaceTemplate(value);
    }

    return key;
  };

  return { t };
}

export function useDictionary() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  // Replace template variables in the dictionary
  return useMemo(() => {
    return replaceTemplateInObject(dictionaries[locale]);
  }, [locale]);
}

