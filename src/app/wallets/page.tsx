
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { wallets as mockWallets } from '@/lib/data';
import { WalletCard } from '@/components/wallets/wallet-card';
import type { Wallet } from '@/lib/types';

export default function WalletsPage() {
  const [wallets, setWallets] = React.useState<Wallet[]>(mockWallets);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your connected wallets and exchange accounts.
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle />
          Add Wallet
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}
