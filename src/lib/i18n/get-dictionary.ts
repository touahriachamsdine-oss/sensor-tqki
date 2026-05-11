import 'server-only';
import type { Locale } from './i18n-config';

const dictionaries = {
  en: () => import('./en').then(module => module.dictionary),
  ar: () => import('./ar').then(module => module.dictionary),
  fr: () => import('./fr').then(module => module.dictionary),
};

export const getDictionary = async (locale: Locale) => {
  return locale in dictionaries ? dictionaries[locale as keyof typeof dictionaries]() : dictionaries.en();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
