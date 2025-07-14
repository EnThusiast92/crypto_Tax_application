'use client';

import type { Wallet } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, RefreshCw, Trash2, Eye } from 'lucide-react';
import { ProviderIcon } from './provider-icon';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const formattedBalance = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(wallet.balance);

  const blockchainColor: Record<Wallet['blockchain'], string> = {
    Ethereum: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Solana: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    BSC: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Polygon: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    Bitcoin: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Avalanche: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <Card className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-4">
          <ProviderIcon provider={wallet.provider} className="w-10 h-10" />
          <div>
            <CardTitle>{wallet.name}</CardTitle>
            <CardDescription>{wallet.provider}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" /> Re-sync
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-bold">{formattedBalance}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Transactions</p>
          <p className="text-lg font-semibold">{wallet.transactionCount}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn(blockchainColor[wallet.blockchain])}>
          {wallet.blockchain}
        </Badge>
        <Badge variant={wallet.type === 'CEX' ? 'secondary' : 'default'}>
          {wallet.type}
        </Badge>
      </CardFooter>
    </Card>
  );
}
