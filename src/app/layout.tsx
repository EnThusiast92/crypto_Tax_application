
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/app-shell';
import { TransactionsProvider } from '@/context/transactions-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { SettingsProvider } from '@/context/settings-context';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isFirebaseReady } = useAuth();
  const pathname = usePathname();

  if (!isFirebaseReady) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-muted-foreground">Connecting to TaxWise...</p>
            </div>
        </div>
    );
  }

  const noShellPages = ['/login', '/register', '/'];
  const isShellRequired = user && !noShellPages.includes(pathname);

  return (
    <>
      {isShellRequired ? (
        <AppShell>{children}</AppShell>
      ) : (
        children
      )}
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="dark">
      <head>
        <title>TaxWise Crypto</title>
        <meta name="description" content="AI-powered crypto tax calculation" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SettingsProvider>
            <TransactionsProvider>
              <AppContent>{children}</AppContent>
            </TransactionsProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
