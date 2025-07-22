
'use client';

import * as React from 'react';
import type { FC, ReactNode } from 'react';

type IconMap = Record<string, string>;

type IconContextType = {
  iconMap: IconMap;
  isLoading: boolean;
};

const IconContext = React.createContext<IconContextType | undefined>(undefined);

export const IconProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [iconMap, setIconMap] = React.useState<IconMap>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchIconMap = async () => {
      try {
        // This file is generated at build time by scripts/fetch-icons.js
        const response = await fetch('/coingecko-icons.json');
        if (!response.ok) {
          throw new Error('Failed to load coingecko-icons.json');
        }
        const data: IconMap = await response.json();
        setIconMap(data);
      } catch (error) {
        console.error('Error loading local icon map:', error);
        // Keep the icon map empty on error, fallbacks will be used
      } finally {
        setIsLoading(false);
      }
    };

    fetchIconMap();
  }, []);

  const value = { iconMap, isLoading };

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
};

export function useIconContext() {
  const context = React.useContext(IconContext);
  if (context === undefined) {
    throw new Error('useIconContext must be used within an IconProvider');
  }
  return context;
}
