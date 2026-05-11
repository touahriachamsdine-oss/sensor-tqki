import { redirect } from 'next/navigation';
import { getCurrentLocale } from '@/lib/i18n/get-current-locale';

// This is the root page, it redirects to the default locale
export default async function RootPage() {
  const locale = await getCurrentLocale();
  redirect(`/${locale}`);
}
