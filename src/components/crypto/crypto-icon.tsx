
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GenericIcon = ({ className }: { className?: string }) => (
    <svg 
      className={cn("text-muted", className)} 
      role="img" 
      aria-label="Generic crypto icon" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
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
      setError(true);
      return;
    }
    
    setIsLoading(true);
    setError(false);
    setIconUrl(null);

    fetch(`/api/crypto/icon?symbol=${asset.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        if (data.iconUrl && !data.iconUrl.includes('default-icon')) {
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
    setIconUrl(null);
  };
  
  if (isLoading) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  if (error || !iconUrl) {
    return (
        <div className={cn("flex items-center justify-center rounded-full bg-muted/50", className)}>
            <GenericIcon className="w-2/3 h-2/3 text-muted-foreground" />
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
