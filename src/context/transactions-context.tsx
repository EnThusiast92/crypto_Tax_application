
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
    // Do not fetch transactions if there is no user.
    if (!user) {
      setTransactions([]); // Clear transactions on logout
      setLoading(false);
      return;
    }

    setLoading(true);
    // Path to the user's specific transactions subcollection
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

    // Cleanup the listener when the component unmounts or the user changes
    return () => unsubscribe();
  }, [user, toast]);

  const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'value'>) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'You must be logged in to add a transaction.', variant: 'destructive' });
        return;
    };

    try {
      const transactionsCol = collection(db, `users/${user.id}/transactions`);
      const newTransaction = {
        ...newTransactionData,
        value: newTransactionData.quantity * newTransactionData.price,
      };
      await addDoc(transactionsCol, newTransaction);
      // The onSnapshot listener will automatically update the local state.
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
            const docRef = doc(transactionsCol); // Create a new doc with a random ID in the subcollection
            const newTransaction = {
                ...txData,
                value: txData.quantity * txData.price,
            };
            batch.set(docRef, newTransaction);
        });

        await batch.commit();
        // The onSnapshot listener will automatically update the local state.
        
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
