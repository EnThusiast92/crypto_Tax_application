'use client'

import React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, LifeBuoy, Search } from 'lucide-react';
import { SidebarNav } from './layout/sidebar-nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen">
        <Sidebar>
            <SidebarContent className="p-0 flex flex-col">
                <SidebarHeader className="p-4 border-b">
                    <div className="flex items-center gap-2">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text" />
                            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
                            <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="neon-purple-text"/>
                         </svg>
                        <h1 className="text-xl font-headline font-semibold">TaxWise</h1>
                    </div>
                </SidebarHeader>
                <div className="flex-1 p-4">
                    <SidebarNav />
                </div>
                 <SidebarFooter className="p-4 mt-auto border-t">
                     <Button variant="ghost" className="w-full justify-start gap-2">
                        <LifeBuoy className="w-4 h-4" />
                        <span>Support</span>
                     </Button>
                </SidebarFooter>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
                 <SidebarTrigger className="md:hidden" />
                 <div className="flex-1">
                 </div>
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
            <main className="p-6">
                <div className="mx-auto w-full max-w-screen-2xl">
                    {children}
                </div>
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}