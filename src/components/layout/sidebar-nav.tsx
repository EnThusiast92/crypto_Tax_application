'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Upload, FileText, Sparkles, Settings } from 'lucide-react';

const links = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Classifier', href: '/classifier', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = (pathname === '/' && link.href === '/') || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Button
            key={link.name}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              "justify-start gap-3",
              isActive && "font-bold text-primary bg-primary/10"
            )}
          >
            <Link href={link.href}>
              <link.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{link.name}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
