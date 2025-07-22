
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

// Simple in-memory cache
const iconCache = new Map<string, string>();

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
    
    const fetchIcon = async () => {
      setIsLoading(true);
      setError(false);
      
      // 1. Check cache first
      if (iconCache.has(assetSymbol)) {
        setIconUrl(iconCache.get(assetSymbol)!);
        setIsLoading(false);
        return;
      }

      try {
        // 2. Fetch from Coingecko API
        // This is a simplified approach. A more robust solution might involve a backend to avoid exposing API keys
        // or to handle more complex logic for finding the right coin ID.
        const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!listRes.ok) throw new Error('Failed to fetch coin list');
        const coinList = await listRes.json();
        
        const coin = coinList.find((c: any) => c.symbol === assetSymbol);

        if (coin?.id) {
          const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
          if (!coinRes.ok) throw new Error('Failed to fetch coin details');
          const coinData = await coinRes.json();
          const url = coinData.image?.small || coinData.image?.large;
          
          if (!isCancelled) {
            if (url) {
              setIconUrl(url);
              iconCache.set(assetSymbol, url); // Save to cache
            } else {
              setError(true);
            }
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

    fetchIcon();
      
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
