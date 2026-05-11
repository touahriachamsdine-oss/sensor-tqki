'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

interface NavLinkProps extends ComponentProps<typeof Link> {
  icon: LucideIcon;
}

export default function NavLink({ href, children, icon: Icon, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href.toString();

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-foreground hover:bg-accent/50 hover:text-accent-foreground'
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
