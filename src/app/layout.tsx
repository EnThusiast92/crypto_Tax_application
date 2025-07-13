import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/app-shell';
import { TransactionsProvider } from '@/context/transactions-context';

export const metadata: Metadata = {
  title: 'TaxWise Crypto',
  description: 'AI-powered crypto tax calculation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <TransactionsProvider>
          <AppShell>
            {children}
          </AppShell>
        </TransactionsProvider>
        <Toaster />
      </body>
    </html>
  );
}
