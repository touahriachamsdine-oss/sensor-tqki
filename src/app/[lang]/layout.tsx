
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { SensorDataProvider } from '@/hooks/use-sensor-data';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { DictionaryProvider } from '@/hooks/use-dictionary';
import type { Locale } from '@/lib/i18n/i18n-config';
import BottomNav from '@/components/layout/bottom-nav';

export default async function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <div
      dir={dictionary.dir}
      className={cn(
        'min-h-screen bg-background font-body antialiased',
        'flex flex-col'
      )}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DictionaryProvider dictionary={dictionary}>
          <SensorDataProvider>
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <BottomNav />
            <Toaster />
          </SensorDataProvider>
        </DictionaryProvider>
      </ThemeProvider>
    </div>
  );
}
