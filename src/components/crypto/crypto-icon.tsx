
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GenericIcon = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center justify-center rounded-full bg-muted/50", className)}>
         <svg 
            className="w-2/3 h-2/3 text-muted-foreground"
            role="img" 
            aria-label="Generic crypto icon" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
    </div>
);

interface CryptoIconProps {
  asset: string;
  className?: string;
}

// In-memory cache for coin IDs to avoid repeated lookups if we need them later.
const coinIdCache = new Map<string, string>();

export function CryptoIcon({ asset, className = 'w-6 h-6' }: CryptoIconProps) {
  const [iconUrl, setIconUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const assetSymbol = asset?.toLowerCase();

  React.useEffect(() => {
    if (!assetSymbol) {
      setIsLoading(false);
      setError(true);
      return;
    }
    
    let isCancelled = false;
    
    const fetchAndSetIconUrl = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // First, check if we have a cached coin ID for this symbol
        if (coinIdCache.has(assetSymbol)) {
          const coinId = coinIdCache.get(assetSymbol)!;
          const url = `https://assets.coingecko.com/coins/images/${coinId}/small.png`;
          if (!isCancelled) {
            setIconUrl(url);
            setIsLoading(false);
          }
          return;
        }

        // If not cached, fetch the full list to find the coin ID
        const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!listRes.ok) throw new Error('Failed to fetch coin list');
        const coinList = await listRes.json();
        
        const coin = coinList.find((c: any) => c.symbol === assetSymbol);

        if (coin?.id) {
          // Cache the found ID
          coinIdCache.set(assetSymbol, coin.id);
          const url = `https://coin-images.coingecko.com/coins/images/${coin.id}/small.png`;
          
          if (!isCancelled) {
            setIconUrl(url);
          }
        } else {
           if (!isCancelled) setError(true);
        }

      } catch (err) {
        if (!isCancelled) {
          console.error(`Failed to fetch icon for ${asset}:`, err);
          setError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAndSetIconUrl();
      
    return () => {
        isCancelled = true;
    };
  }, [assetSymbol]);
  
  if (isLoading) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  if (error || !iconUrl) {
    return <GenericIcon className={className} />;
  }

  return (
    <div className={cn("relative rounded-full", className)}>
       <Image
          src={iconUrl}
          alt={`${asset} logo`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain rounded-full"
          onError={() => setError(true)} 
          unoptimized // Necessary for external URLs from services like Coingecko
        />
    </div>
  );
}
