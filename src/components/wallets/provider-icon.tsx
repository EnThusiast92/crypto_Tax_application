import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { WalletProvider } from '@/lib/types';
import { Wallet } from 'lucide-react';

const iconMap: Record<WalletProvider, string> = {
  Binance: '/icons/binance.svg',
  Coinbase: '/icons/coinbase.svg',
  Kraken: '/icons/kraken.svg',
  MetaMask: '/icons/metamask.svg',
  Phantom: '/icons/phantom.svg',
  Ledger: '/icons/ledger.svg',
};

const IconWrapper = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center rounded-full bg-muted", className)}>
    <Wallet className="w-1/2 h-1/2 text-muted-foreground" />
  </div>
);


export function ProviderIcon({ provider, className }: { provider: WalletProvider, className?: string }) {
  const iconSrc = iconMap[provider];

  if (!iconSrc) {
    return <IconWrapper className={className} />;
  }

  return (
    <div className={cn("relative", className)}>
      <Image
        src={iconSrc}
        alt={`${provider} logo`}
        fill
        className="object-contain"
        data-ai-hint={`${provider} logo`}
      />
    </div>
  );
}
