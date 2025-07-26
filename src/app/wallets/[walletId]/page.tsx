
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallets } from '@/context/wallets-context';
import { useTransactions } from '@/context/transactions-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Filter, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WalletDetailPage() {
  const params = useParams();
  const walletId = params.walletId as string;
  const { wallets } = useWallets();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const wallet = wallets.find(w => w.id === walletId);

  // Filter transactions for this specific wallet
  const walletTransactions = React.useMemo(() => {
    return transactions.filter(tx => tx.walletId === walletId);
  }, [transactions, walletId]);

  const handleSync = () => {
    setIsSyncing(true);
    // In a real app, this would trigger the `syncWallet` cloud function.
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };
  
  if (!wallet) {
    return (
        <div className="flex flex-col gap-8">
            <header>
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-80" />
                </div>
            </div>
            </header>
        </div>
    );
  }
  
  const liveBalance = walletTransactions.reduce((acc, tx) => acc + tx.value, 0);
  const discrepancy = liveBalance - wallet.reportedBalance;
  
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
       <header>
          <Button asChild variant="ghost" className="mb-4 -ml-4">
              <Link href="/wallets">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Wallets
              </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold font-headline">{wallet.name}</h1>
                    <Badge variant={wallet.type === 'CEX' ? 'secondary' : 'outline'}>{wallet.type}</Badge>
                </div>
                <p className="text-muted-foreground font-mono text-sm mt-1">
                    {wallet.identifier}
                </p>
            </div>
            <Button onClick={handleSync} disabled={isSyncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Live Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(liveBalance)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Reported Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(wallet.reportedBalance)}</p>
            </CardContent>
        </Card>
        <Card className={discrepancy !== 0 ? 'border-destructive' : ''}>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Discrepancy</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold ${discrepancy !== 0 ? 'text-destructive' : ''}`}>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(discrepancy)}</p>
            </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Wallet Transactions</CardTitle>
                <CardDescription>All transactions associated with this wallet.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Filter by date..." className="pl-10" />
                </div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Type
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem>Buy</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Sell</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Swap</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : (
                <TransactionsTable data={walletTransactions} />
            )}
          </CardContent>
        </Card>
    </div>
  );
}
