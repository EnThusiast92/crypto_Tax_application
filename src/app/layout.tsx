
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/app-shell';
import { TransactionsProvider } from '@/context/transactions-context';
import { AuthProvider } from '@/context/auth-context';
import { SettingsProvider } from '@/context/settings-context';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noShellPages = ['/', '/login', '/register'];
  const isShellRequired = !noShellPages.includes(pathname);

  // Metadata can't be in a client component, so we conditionally render a Head component
  // for the title, or we could use a server layout to read the path.
  // For simplicity here, we'll just have a single layout.

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
              {isShellRequired ? (
                <AppShell>
                  {children}
                </AppShell>
              ) : (
                children
              )}
            </TransactionsProvider>
          </SettingsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
