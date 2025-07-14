
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GenericIcon = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Generic crypto icon">
      <circle cx="50" cy="50" r="50" fill="hsl(var(--muted))" />
    </svg>
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
      return;
    }
    
    setIsLoading(true);
    setError(false);
    setIconUrl(null);

    fetch(`/api/crypto/icon?symbol=${asset}`)
      .then(res => res.json())
      .then(data => {
        if (data.iconUrl && !data.iconUrl.endsWith('default.png')) {
          setIconUrl(data.iconUrl);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
      
  }, [asset]);
  
  const handleImageError = () => {
    setError(true);
  };
  
  if (isLoading) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  if (error || !iconUrl) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <GenericIcon />
        </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
       <Image
          src={iconUrl}
          alt={`${asset} logo`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain rounded-full"
          onError={handleImageError}
        />
    </div>
  );
}
