
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
    if (!user) {
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
      console.error("Error fetching wallets snapshot:", error);
      toast({ title: 'Error', description: 'Could not fetch wallets.', variant: 'destructive' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);
  
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
        status: 'connected',
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
