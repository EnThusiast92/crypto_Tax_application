
'use client';

import * as React from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { SettingsProvider } from '@/context/settings-context';
import { TransactionsProvider } from '@/context/transactions-context';
import AppShell from '@/components/app-shell';
import { useRouter, usePathname } from 'next/navigation';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    React.useEffect(() => {
        if (!loading && !user) {
            // Redirect to login only if we are not already on a public page
            // This prevents redirect loops if the user is already on the login page
            const isPublicPage = ['/login', '/register', '/'].includes(pathname);
            if (!isPublicPage) {
                router.push('/login');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
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
    
    if (user) {
         return (
            <SettingsProvider>
                <AppShell>{children}</AppShell>
            </SettingsProvider>
        )
    }

    // If not loading and no user, we are likely about to redirect, so we can return null
    // or a minimal loader to avoid flashing content.
    return null;
}


export function AuthenticatedApp({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}
