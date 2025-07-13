
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ICON_BASE_URL = 'https://www.cryptocompare.com';

const GenericIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="hsl(var(--muted))" />
    </svg>
);

interface CryptoIconProps {
  asset: string;
  className?: string;
}

export function CryptoIcon({ asset, className = 'w-6 h-6' }: CryptoIconProps) {
  const [error, setError] = React.useState(false);

  // Corrected and verified image paths
  const assetImageMap: { [key: string]: string } = {
    BTC: '/media/37746251/btc.png',
    ETH: '/media/35309662/eth.png',
    ADA: '/media/37746235/ada.png',
    SOL: '/media/37747734/sol.png',
    DOGE: '/media/37746339/doge.png',
    LINK: '/media/37746248/link.png',
    USDC: '/media/37746338/usdc.png',
    JTO: '/media/44064431/jto.png',
  };
  
  const iconPath = assetImageMap[asset.toUpperCase()];

  if (error || !iconPath) {
    return <div className={cn("flex items-center justify-center", className)}><GenericIcon /></div>;
  }

  return (
    <div className={cn("relative", className)}>
       <Image
          src={`${ICON_BASE_URL}${iconPath}`}
          alt={`${asset} logo`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain"
          onError={() => setError(true)}
          unoptimized
        />
    </div>
  );
}
