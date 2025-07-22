
'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

type IconMap = Record<string, string>;
type ErrorMap = Record<string, boolean>;
type LoadingMap = Record<string, boolean>;

type IconContextType = {
  iconMap: IconMap;
  requestIcon: (symbol: string) => void;
  isLoading: (symbol: string) => boolean;
  hasError: (symbol: string, isError?: boolean) => boolean;
};

const IconContext = React.createContext<IconContextType | undefined>(undefined);

// A custom hook for debouncing
const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  return React.useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export function IconProvider({ children }: { children: React.ReactNode }) {
  const [iconMap, setIconMap] = React.useState<IconMap>({});
  const [errorMap, setErrorMap] = React.useState<ErrorMap>({});
  const [loadingMap, setLoadingMap] = React.useState<LoadingMap>({});
  const pendingSymbolsRef = React.useRef<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchIcons = useDebouncedCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;

    setLoadingMap(prev => {
        const newLoading = {...prev};
        symbols.forEach(s => newLoading[s] = true);
        return newLoading;
    });

    try {
      const res = await fetch(`/api/crypto/icons?symbols=${symbols.join(',')}`);
      if (!res.ok) {
        const errorData = await res.text();
        console.error(`Batch icon fetch failed: ${res.status}`, errorData);
        throw new Error('Batch fetch failed');
      }
      
      const data: IconMap = await res.json();

      setIconMap(prev => ({...prev, ...data}));

      // Mark symbols that were requested but not returned as errored
      const returnedSymbols = new Set(Object.keys(data));
      const failedSymbols = symbols.filter(s => !returnedSymbols.has(s));
      if (failedSymbols.length > 0) {
        setErrorMap(prev => {
          const newErrors = {...prev};
          failedSymbols.forEach(s => newErrors[s] = true);
          return newErrors;
        });
      }

    } catch (err) {
      console.error('Error fetching icon batch:', err);
      setErrorMap(prev => {
        const newErrors = {...prev};
        symbols.forEach(s => newErrors[s] = true);
        return newErrors;
      });
      toast({
          title: "Icon Loading Error",
          description: "Could not load some crypto icons. This may be due to API rate limits.",
          variant: 'destructive',
      });
    } finally {
      setLoadingMap(prev => {
          const newLoading = {...prev};
          symbols.forEach(s => delete newLoading[s]);
          return newLoading;
      });
    }
  }, 200); // Debounce for 200ms

  const requestIcon = React.useCallback((symbol: string) => {
    const s = symbol.toLowerCase();
    if (!iconMap[s] && !errorMap[s] && !loadingMap[s] && !pendingSymbolsRef.current.has(s)) {
      pendingSymbolsRef.current.add(s);
      fetchIcons(Array.from(pendingSymbolsRef.current));
    }
  }, [iconMap, errorMap, loadingMap, fetchIcons]);

  const isLoading = (symbol: string) => !!loadingMap[symbol.toLowerCase()];
  
  const hasError = (symbol: string, isError: boolean = false) => {
      const s = symbol.toLowerCase();
      if (isError && !errorMap[s]) {
          setErrorMap(prev => ({...prev, [s]: true}));
          return true;
      }
      return !!errorMap[s];
  };

  return (
    <IconContext.Provider value={{ iconMap, requestIcon, isLoading, hasError }}>
      {children}
    </IconContext.Provider>
  );
}

export function useIconContext() {
  const context = React.useContext(IconContext);
  if (context === undefined) {
    throw new Error('useIconContext must be used within an IconProvider');
  }
  return context;
}
