
'use client';

import type { Wallet } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CryptoIcon } from '../crypto/crypto-icon';

interface WalletListItemProps {
  wallet: Wallet;
}

const getWalletIcon = (walletName: string) => {
    const name = walletName.toLowerCase();
    if (name.includes('binance')) return 'https://i.imgur.com/4E23bHl.png';
    if (name.includes('revolut')) return 'https://i.imgur.com/G2k3UVs.png';
    if (name.includes('bitmex')) return 'https://i.imgur.com/K2sN15g.png';
    if (name.includes('bitfinex')) return 'https://i.imgur.com/J4a259c.png';
    if (name.includes('etoro')) return 'https://i.imgur.com/E3Un35J.png';
    if (name.includes('hyperliquid')) return 'https://i.imgur.com/J4lHwM6.png';
    if (name.includes('zksync')) return 'https://i.imgur.com/pZqY5sE.png';
    if (name.includes('solana')) return 'https://i.imgur.com/39w9tLz.png';
    return null;
}

const StatusIndicator = ({ status }: { status: Wallet['status'] }) => {
    if (status === 'sync_failed') {
        return (
            <Badge variant="destructive" className="gap-1.5 pl-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                SYNC FAILED
            </Badge>
        )
    }
     if (status === 'synced') {
        return (
             <Badge variant="outline" className="gap-1.5 pl-1.5 border-green-500/50 text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                SYNCED
            </Badge>
        )
    }
    return null;
}


export function WalletListItem({ wallet }: WalletListItemProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/wallets/${wallet.id}`);
  };
  
  const iconSrc = getWalletIcon(wallet.name);

  return (
    <div
      onClick={handleRowClick}
      className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,1fr,1fr,auto] items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer gap-x-4 gap-y-2"
    >
      {/* Icon */}
      <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted/50">
        {iconSrc ? (
            <Image src={iconSrc} alt={`${wallet.name} logo`} width={28} height={28} className="object-contain" />
        ) : (
            <CryptoIcon asset={wallet.name} className="w-7 h-7" />
        )}
      </div>

      {/* Name and Status */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
            <p className="font-semibold">{wallet.name}</p>
            {wallet.type === 'DEX' && <p className="text-sm text-muted-foreground font-mono hidden sm:block">{wallet.identifier.slice(0, 6)}...{wallet.identifier.slice(-4)}</p>}
        </div>
        <div className="flex items-center gap-2">
            <StatusIndicator status={wallet.status} />
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(wallet.lastSyncAt.toDate(), { addSuffix: true })}</p>
        </div>
      </div>
      
      {/* Transactions Info - hidden on small screens */}
      <div className="hidden md:flex flex-col text-right">
        <p className="font-medium text-primary">{wallet.transactionsCount} transactions</p>
        <p className="text-xs text-muted-foreground">a month ago</p>
      </div>

      {/* Total Value - hidden on small screens */}
      <div className="hidden md:flex flex-col text-right">
        <p className="font-semibold text-lg">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(wallet.reportedBalance)}
        </p>
        <p className="text-xs text-muted-foreground">Total value</p>
      </div>
      
       {/* Actions */}
      <div className="justify-self-end">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Sync Now</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(); }}>View Details</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                    Delete Wallet
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
