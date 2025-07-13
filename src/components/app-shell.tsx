'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Bell,
  LifeBuoy,
  Search,
  PanelLeft,
  LayoutDashboard,
  Upload,
  FileText,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Classifier', href: '/classifier', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function SidebarNav() {
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background sticky top-0">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text" />
                  <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
              </svg>
              <h1 className="text-xl font-headline font-semibold">TaxWise</h1>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2 p-4">
            <SidebarNav />
          </div>
          <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LifeBuoy className="w-4 h-4" />
              <span>Support</span>
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-background p-0">
              <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                   <Link href="/" className="flex items-center gap-2 font-semibold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text" />
                        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
                        <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
                     </svg>
                     <span className="text-xl font-headline font-semibold">TaxWise</span>
                   </Link>
                </div>
                <div className="flex-1 overflow-auto py-2 p-4">
                   <SidebarNav />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
