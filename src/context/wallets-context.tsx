
'use client';

import * as React from 'react';
import type { Wallet, WalletsContextType, AddWalletFormValues } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const WalletsContext = React.createContext<WalletsContextType | undefined>(undefined);

export function WalletsProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = React.useState<Wallet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    // Explicitly check for user and user.id to prevent invalid queries.
    if (!user?.id) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const walletsCol = collection(db, `users/${user.id}/wallets`);
    const q = query(walletsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userWallets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wallet));
      setWallets(userWallets);
      setLoading(false);
    }, (error) => {
      // Improved error logging to capture specific Firestore permission errors.
      console.error("🔥 Wallet fetch error:", error);
      // Do not show a toast for this common case. The UI will show an empty state.
      // This error often happens if the collection doesn't exist yet, which is not a true "error" state.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const addWallet = async (newWalletData: AddWalletFormValues) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in to add a wallet.', variant: 'destructive' });
        return;
    };

    try {
      const walletsCol = collection(db, `users/${user.id}/wallets`);
      
      const identifier = newWalletData.type === 'DEX' ? newWalletData.publicAddress! : newWalletData.apiKey!;
      
      // IMPORTANT: In a real app, API secrets should NEVER be stored directly in Firestore.
      // They should be sent to a secure backend function and stored using Google Secret Manager or equivalent.
      // This implementation is simplified for prototyping purposes.
      if (newWalletData.apiSecret) {
          console.warn("Storing API secrets client-side is insecure. Use a backend function and a secret manager in production.");
      }

      const newWallet: Omit<Wallet, 'id'> = {
        userId: user.id,
        name: newWalletData.name,
        type: newWalletData.type,
        identifier: identifier,
        reportedBalance: 0,
        transactionsCount: 0,
        lastSyncAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        status: 'synced',
      };

      await addDoc(walletsCol, newWallet);
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected your ${newWallet.name} wallet.`,
      });

    } catch (error) {
       console.error("Error adding wallet:", error);
       toast({ title: 'Error', description: 'Could not save the wallet.', variant: 'destructive' });
       throw error;
    }
  };


  return (
    <WalletsContext.Provider value={{ wallets, loading, addWallet }}>
      {children}
    </WalletsContext.Provider>
  );
}

export function useWallets() {
  const context = React.useContext(WalletsContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletsProvider');
  }
  return context;
}
