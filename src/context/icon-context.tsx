
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
  // Keep track of symbols we've already tried to fetch to prevent re-fetching
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
    if (!symbol) return;
    const lowerSymbol = symbol.toLowerCase();
    
    // Do not re-fetch if it's already in the map or has been attempted
    if (iconMap[lowerSymbol] || attemptedFetches.current.has(lowerSymbol)) {
      return;
    }
    
    attemptedFetches.current.add(lowerSymbol);

    try {
      const res = await fetch(`/api/crypto/icon?symbol=${lowerSymbol}`);
      if (!res.ok) {
        // The API route now returns a specific 404 if not found, so this is a graceful failure.
        // The component will handle the fallback. We don't need to throw an error.
        console.warn(`Could not fetch icon for ${symbol}. Status: ${res.status}`);
        // Add a "not_found" sentinel value to prevent refetching
        setIconMap(prevMap => ({
          ...prevMap,
          [lowerSymbol]: 'not_found',
        }));
        return;
      }
      const data = await res.json();
      if (data.iconUrl) {
        setIconMap(prevMap => ({
          ...prevMap,
          [lowerSymbol]: data.iconUrl,
        }));
      } else {
         // Mark as not found if API returns ok but no URL
         setIconMap(prevMap => ({ ...prevMap, [lowerSymbol]: 'not_found' }));
      }
    } catch (error) {
      console.error(`Error fetching icon for ${symbol}:`, error);
      setIconMap(prevMap => ({ ...prevMap, [lowerSymbol]: 'not_found' }));
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
