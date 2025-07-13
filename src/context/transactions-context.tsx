'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/types';
import { transactions as initialTransactions } from '@/lib/data';

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (newTransactionData: Omit<Transaction, 'id' | 'value'>) => void;
};

const TransactionsContext = React.createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);

  const addTransaction = (newTransactionData: Omit<Transaction, 'id' | 'value'>) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: `TXN${(transactions.length + 1).toString().padStart(3, '0')}`,
      value: newTransactionData.quantity * newTransactionData.price,
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction }}>
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
