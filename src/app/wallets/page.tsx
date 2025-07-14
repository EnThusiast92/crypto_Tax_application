
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { wallets as mockWallets } from '@/lib/data';
import { WalletCard } from '@/components/wallets/wallet-card';
import type { Wallet } from '@/lib/types';
import { AddWalletDialog } from '@/components/wallets/add-wallet-dialog';
import { useToast } from '@/hooks/use-toast';

export default function WalletsPage() {
  const [wallets, setWallets] = React.useState<Wallet[]>(mockWallets);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddWallet = (walletData: Omit<Wallet, 'id' | 'transactionCount' | 'balance' | 'createdAt' | 'updatedAt'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `wallet-${wallets.length + 1}`,
      transactionCount: 0,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWallets((prev) => [newWallet, ...prev]);
    toast({
      title: 'Wallet Added',
      description: `The ${walletData.name} wallet has been successfully added.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your connected wallets and exchange accounts.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <PlusCircle />
          Add Wallet
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
        {/* Placeholder for adding a new wallet */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <PlusCircle className="h-8 w-8" />
          <span className="font-semibold">Add New Wallet</span>
        </button>
      </div>
      <AddWalletDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onWalletAdd={handleAddWallet}
      />
    </div>
  );
}
