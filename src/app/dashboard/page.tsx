
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { statCards } from '@/lib/data';
import { StatCard } from '@/components/dashboard/stat-card';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useTransactions, TransactionsProvider } from '@/context/transactions-context';

function DashboardPageContent() {
  const { transactions } = useTransactions();
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user?.role === 'TaxConsultant') {
      router.replace('/consultant/dashboard');
    }
  }, [user, router]);

  // Prevent rendering the dashboard for the wrong role or while user is loading
  if (!user || user.role === 'TaxConsultant') {
    return null; // or a loading spinner
  }

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your crypto tax situation.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.title} className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500" style={{animationDelay: `${index * 100}ms`}}>
            <StatCard {...card} />
          </div>
        ))}
      </div>
      <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500" style={{animationDelay: `400ms`}}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionsTable data={recentTransactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <TransactionsProvider>
      <DashboardPageContent />
    </TransactionsProvider>
  )
}
