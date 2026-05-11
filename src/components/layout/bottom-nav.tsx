
'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutGrid, Map, History, Wifi, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/hooks/use-dictionary';
import type { Locale } from '@/lib/i18n/i18n-config';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '../ui/button';
import { useState } from 'react';
import NavLink from './nav-link';
import { FileDown, Bot, Scaling, FileText, Mountain } from 'lucide-react';


const BottomNavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center gap-1 text-xs w-full h-full rounded-md",
      isActive ? 'text-primary' : 'text-muted-foreground'
    )}>
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  );
};


function MobileMenuSheet() {
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
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                 <button className="flex flex-col items-center justify-center gap-1 text-xs w-full h-full rounded-md text-muted-foreground">
                    <Menu className="h-6 w-6" />
                    <span>More</span>
                </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="w-full rounded-t-lg">
                <SheetHeader>
                    <SheetTitle>All Pages</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 grid grid-cols-3 gap-4">
                    {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-2 rounded-lg p-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs text-center">{item.label}</span>
                    </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}


export default function BottomNav() {
  const { dictionary } = useDictionary();
  const params = useParams();
  const lang = params.lang as Locale;

  const mainNavItems = [
    { href: `/${lang}/dashboard`, label: dictionary.nav.dashboard, icon: LayoutGrid },
    { href: `/${lang}/3d-map`, label: dictionary.nav.map3d, icon: Map },
    { href: `/${lang}/history`, label: dictionary.nav.history, icon: History },
    { href: `/${lang}/connect`, label: dictionary.nav.connect, icon: Wifi },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-16 grid-cols-5 items-stretch">
        {mainNavItems.map(item => (
          <BottomNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <MobileMenuSheet />
      </div>
    </div>
  );
}
