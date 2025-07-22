
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { AuthenticatedApp } from '@/components/layout/authenticated-app';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const noShellPages = ['/login', '/register', '/'];
  const isPublicPage = noShellPages.includes(pathname);

  React.useEffect(() => {
    if (!loading && user && isPublicPage) {
        if (user.role === 'TaxConsultant') {
            router.push('/consultant/dashboard');
        } else {
            router.push('/dashboard');
        }
    }
  }, [user, loading, isPublicPage, router]);


  if (isPublicPage) {
    return <>{children}</>;
  }

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
        <AuthProvider>
            <AppContent>{children}</AppContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
