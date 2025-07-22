
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { AuthenticatedApp } from '@/components/layout/authenticated-app';

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noShellPages = ['/login', '/register', '/'];
  const isPublicPage = noShellPages.includes(pathname);

  // If it's a public page, just render the children. No providers, no auth checks.
  if (isPublicPage) {
    return <>{children}</>;
  }

  // For protected pages, wrap them in the full authenticated app structure.
  // The AuthProvider inside AuthenticatedApp will handle loading and redirects.
  return <AuthenticatedApp>{children}</AuthenticatedApp>;
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
        <AppContent>{children}</AppContent>
        <Toaster />
      </body>
    </html>
  );
}
