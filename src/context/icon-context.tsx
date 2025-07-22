
'use client';

import * as React from 'react';
import type { FC, ReactNode } from 'react';

type IconMap = Record<string, string>;

type IconContextType = {
  getIcon: (symbol: string) => string | undefined;
  fetchAndCacheIcon: (symbol: string) => Promise<void>;
  isLoading: boolean;
};

const IconContext = React.createContext<IconContextType | undefined>(undefined);

export const IconProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [iconMap, setIconMap] = React.useState<IconMap>({});
  const [isLoading, setIsLoading] = React.useState(true);
  // Keep track of symbols we've already tried to fetch to prevent re-fetching on every render
  const attemptedFetches = React.useRef(new Set<string>());

  React.useEffect(() => {
    const fetchIconMap = async () => {
      try {
        const response = await fetch('/coingecko-icons.json');
        if (!response.ok) {
          throw new Error('Failed to load coingecko-icons.json');
        }
        const data: IconMap = await response.json();
        setIconMap(data);
      } catch (error) {
        console.error('Error loading local icon map:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIconMap();
  }, []);

  const getIcon = React.useCallback((symbol: string): string | undefined => {
    return iconMap[symbol?.toLowerCase()];
  }, [iconMap]);

  const fetchAndCacheIcon = React.useCallback(async (symbol: string) => {
    const lowerSymbol = symbol.toLowerCase();
    if (!lowerSymbol || iconMap[lowerSymbol] || attemptedFetches.current.has(lowerSymbol)) {
      return;
    }
    
    attemptedFetches.current.add(lowerSymbol);

    try {
      const res = await fetch(`/api/crypto/icon?symbol=${lowerSymbol}`);
      if (!res.ok) {
        // Don't throw an error, just log it. The component will handle the fallback.
        console.warn(`Could not fetch icon for ${symbol}. Status: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.iconUrl) {
        setIconMap(prevMap => ({
          ...prevMap,
          [lowerSymbol]: data.iconUrl,
        }));
      }
    } catch (error) {
      console.error(`Error fetching icon for ${symbol}:`, error);
    }
  }, [iconMap]);
  
  const value = { getIcon, fetchAndCacheIcon, isLoading };

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
};

export function useIconContext() {
  const context = React.useContext(IconContext);
  if (context === undefined) {
    throw new Error('useIconContext must be used within an IconProvider');
  }
  return context;
}
