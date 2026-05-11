
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Map,
  History,
  FileDown,
  Bot,
  Scaling,
  Wifi,
  Menu,
  Mountain,
  FileText,
} from 'lucide-react';
import NavLink from './nav-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { useSensorData } from '@/hooks/use-sensor-data';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { useDictionary } from '@/hooks/use-dictionary';
import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n/i18n-config';
import { FsIcon } from '../icons/fs-icon';

function ConnectionStatusIndicator() {
  const { lastUpdateTime } = useSensorData();
  const [isOnline, setIsOnline] = useState(false);
  const { dictionary } = useDictionary();

  useEffect(() => {
    if (lastUpdateTime) {
      const now = Date.now();
      // Consider online if data received in the last 5 seconds
      if (now - lastUpdateTime < 5000) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } else {
      setIsOnline(false);
    }
  }, [lastUpdateTime]);

  return (
    <div className="flex items-center gap-2" title={isOnline ? dictionary.header.sensorsConnected : dictionary.header.sensorsDisconnected}>
      <div className={cn("h-3 w-3 rounded-full transition-colors", isOnline ? "bg-green-500" : "bg-destructive")}></div>
      <span className="sr-only">{isOnline ? dictionary.header.sensorsConnected : dictionary.header.sensorsDisconnected}</span>
    </div>
  )
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { dictionary } = useDictionary();
  const params = useParams();
  const lang = params.lang as Locale;

  const navItems = [
    { href: `/${lang}/dashboard`, label: dictionary.nav.dashboard, icon: LayoutGrid },
    { href: `/${lang}/3d-map`, label: dictionary.nav.map3d, icon: Map },
    { href: `/${lang}/logs`, label: dictionary.nav.logs, icon: FileText },
    { href: `/${lang}/history`, label: dictionary.nav.history, icon: History },
    { href: `/${lang}/export`, label: dictionary.nav.export, icon: FileDown },
    { href: `/${lang}/displacement`, label: dictionary.nav.displacement, icon: Mountain },
    { href: `/${lang}/calibration`, label: dictionary.nav.calibration, icon: Bot },
    { href: `/${lang}/volume-calculation`, label: dictionary.nav.volume, icon: Scaling },
    { href: `/${lang}/connect`, label: dictionary.nav.connect, icon: Wifi },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 font-headline font-bold text-xl"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-card p-1">
            <FsIcon className="h-6 w-6" />
          </div>
          Fares <span className="text-primary">Sensor</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => (
              <NavLink key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ConnectionStatusIndicator />
          <LanguageToggle />
          <ThemeToggle />
          <div className="hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{dictionary.header.openMenu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle className="sr-only">{dictionary.header.mobileNavMenu}</SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col">
                  <div className="border-b pb-4">
                    <Link
                      href={`/${lang}`}
                      className="flex items-center gap-2 font-headline font-bold text-xl"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-foreground bg-primary">
                        <FsIcon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Fares <span className="text-primary">Sensor</span>
                    </Link>
                  </div>
                  <nav className="mt-6 flex flex-col gap-4">
                    {navItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
