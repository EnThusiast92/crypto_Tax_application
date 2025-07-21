
'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type TransactionsContextType = {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (newTransactionData: Omit<Transaction, 'id' | 'value'>) => void;
  addTransactions: (newTransactionsData: Omit<Transaction, 'id' | 'value'>[]) => void;
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

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const transactionsCol = collection(db, `users/${user.id}/transactions`);
        const q = query(transactionsCol, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const userTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({ title: 'Error', description: 'Could not fetch transactions.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, toast]);

  const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'value'>) => {
    if (!user) return;
    try {
      const transactionsCol = collection(db, `users/${user.id}/transactions`);
      const newTransaction = {
        ...newTransactionData,
        value: newTransactionData.quantity * newTransactionData.price,
        createdAt: serverTimestamp(), // For ordering
      };
      const docRef = await addDoc(transactionsCol, newTransaction);
      setTransactions(prev => [{ id: docRef.id, ...newTransaction } as Transaction, ...prev]);
    } catch (error) {
       console.error("Error adding transaction:", error);
       toast({ title: 'Error', description: 'Could not save the transaction.', variant: 'destructive' });
    }
  };

  const addTransactions = (newTransactionsData: Omit<Transaction, 'id' | 'value'>[]) => {
    // This function can be expanded to use batch writes for performance
    newTransactionsData.forEach(tx => addTransaction(tx));
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
