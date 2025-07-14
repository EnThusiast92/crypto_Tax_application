
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

export function CryptoIcon({ asset, className = 'w-6 h-6' }: CryptoIconProps) {
  const [iconUrl, setIconUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!asset) {
      setIsLoading(false);
      setError(true);
      return;
    }
    
    let isCancelled = false;
    setIsLoading(true);
    setError(false);
    setIconUrl(null);

    fetch(`/api/crypto/icon?symbol=${asset.toLowerCase()}`)
      .then(res => {
          if (!res.ok) throw new Error('API response not OK');
          return res.json();
      })
      .then(data => {
        if (!isCancelled) {
          if (data.iconUrl && !data.iconUrl.includes('generic-crypto-icon')) {
            setIconUrl(data.iconUrl);
          } else {
            setError(true);
          }
        }
      })
      .catch(() => {
          if (!isCancelled) setError(true);
      })
      .finally(() => {
          if (!isCancelled) setIsLoading(false);
      });
      
    return () => {
        isCancelled = true;
    };
  }, [asset]);
  
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
          unoptimized // Useful for external SVGs or non-standard image formats
        />
    </div>
  );
}
