
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const GITHUB_ICON_BASE_URL = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/';

// A special map for icons not found in the GitHub library or for overrides.
const specialIconMap: { [key: string]: string } = {
  JTO: 'https://www.cryptocompare.com/media/44033842/jto.png',
  // Add other special cases here if needed in the future
};

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
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [asset]);

  if (!asset) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <GenericIcon />
        </div>
    );
  }
  
  const upperCaseAsset = asset.toUpperCase();
  const lowerCaseAsset = asset.toLowerCase();

  // Check for a special-cased icon first, otherwise use the default library URL.
  const iconUrl = specialIconMap[upperCaseAsset] || `${GITHUB_ICON_BASE_URL}${lowerCaseAsset}.png`;

  if (error) {
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
          className="object-contain"
          onError={() => setError(true)}
          unoptimized
        />
    </div>
  );
}
