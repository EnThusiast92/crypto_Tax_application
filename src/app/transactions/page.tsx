
'use client';

import * as React from 'react';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactions } from '@/context/transactions-context';
import { useWallets } from '@/context/wallets-context';

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { transactions, addTransaction } = useTransactions();
  const { wallets } = useWallets();

  return (
    <>
      <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Transactions</h1>
            <p className="text-muted-foreground">
              View, add, and manage all your crypto transactions.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <PlusCircle />
            Add Transaction
          </Button>
        </header>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Wallet
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Wallet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {wallets.length > 0 ? (
                    wallets.map(wallet => (
                      <DropdownMenuCheckboxItem key={wallet.id}>
                        {wallet.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal p-2">No wallets found</DropdownMenuLabel>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>Buy</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Sell</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Staking</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Airdrop</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Gift</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionsTable data={transactions} />
          </CardContent>
        </Card>
      </div>
      <AddTransactionDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onAddTransaction={addTransaction}
      />
    </>
  );
}
