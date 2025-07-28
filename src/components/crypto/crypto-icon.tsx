
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useIconContext } from '@/context/icon-context';

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

export function CryptoIcon({ asset, className = 'w-6 h-6' }: CryptoIconProps) {
  const { getIcon, fetchAndCacheIcon, isLoading } = useIconContext();
  const [hasError, setHasError] = React.useState(false);

  const assetSymbol = asset?.toLowerCase();
  const iconUrl = getIcon(assetSymbol);

  React.useEffect(() => {
    // Only fetch if the icon isn't in our map at all (undefined)
    if (!isLoading && iconUrl === undefined && assetSymbol) {
      fetchAndCacheIcon(assetSymbol);
    }
  }, [isLoading, iconUrl, assetSymbol, fetchAndCacheIcon]);

  if (isLoading && iconUrl === undefined) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }
  
  // If we have an error, or the icon was fetched and explicitly marked as not found
  if (hasError || iconUrl === 'not_found' || !iconUrl) {
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
          onError={() => setHasError(true)}
          unoptimized
        />
    </div>
  );
}
