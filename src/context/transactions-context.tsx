
'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, writeBatch, doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type TransactionsContextType = {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (newTransactionData: Omit<Transaction, 'id' | 'value'>) => Promise<void>;
  addTransactions: (newTransactionsData: Omit<Transaction, 'id' | 'value'>[]) => Promise<void>;
};

const TransactionsContext = React.createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // This now listens to the user's root transactions collection.
    // This collection will contain transactions from all wallets, synced by the Cloud Function.
    const transactionsCol = collection(db, `users/${user.id}/transactions`);
    const q = query(transactionsCol, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(userTransactions);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching transactions snapshot:", error);
        toast({ title: 'Error', description: 'Could not fetch transactions.', variant: 'destructive' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'value'>) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in to add a transaction.', variant: 'destructive' });
        return;
    };

    try {
      // All transactions, manual or synced, go into the same root collection.
      const transactionsCol = collection(db, `users/${user.id}/transactions`);
      const newTransaction = {
        ...newTransactionData,
        value: newTransactionData.quantity * newTransactionData.price,
      };
      await addDoc(transactionsCol, newTransaction);
    } catch (error) {
       console.error("Error adding transaction:", error);
       toast({ title: 'Error', description: 'Could not save the transaction.', variant: 'destructive' });
    }
  };

  const addTransactions = async (newTransactionsData: Omit<Transaction, 'id' | 'value'>[]) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in to add transactions.', variant: 'destructive' });
        return;
    }
    
    try {
        const transactionsCol = collection(db, `users/${user.id}/transactions`);
        const batch = writeBatch(db);

        newTransactionsData.forEach(txData => {
            const docRef = doc(transactionsCol);
            const newTransaction = {
                ...txData,
                value: txData.quantity * txData.price,
            };
            batch.set(docRef, newTransaction);
        });

        await batch.commit();
        
    } catch (error) {
        console.error("Error adding transactions in batch:", error);
        toast({ title: 'Error', description: 'Could not save the transactions.', variant: 'destructive' });
    }
  };


  return (
    <TransactionsContext.Provider value={{ transactions, loading, addTransaction, addTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = React.useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
