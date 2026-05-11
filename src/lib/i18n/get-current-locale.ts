import { cookies } from 'next/headers';
import type { Locale } from './i18n-config';
import { i18n } from './i18n-config';

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  
  const locale = localeCookie?.value as Locale;

  if (locale && i18n.locales.includes(locale)) {
    return locale;
  }
  
  return i18n.defaultLocale;
}
