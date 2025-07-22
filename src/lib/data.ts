
import type { Transaction, User, StatCardData } from './types';
import { ArrowUpRight, ArrowDownLeft, Banknote, Landmark } from 'lucide-react';
import { db } from './firebase';
import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';

export const statCards: StatCardData[] = [
  {
    title: 'Realized Gains',
    value: '£12,480.50',
    change: '+15.2%',
    changeType: 'increase',
    icon: ArrowUpRight,
  },
  {
    title: 'Realized Losses',
    value: '£3,120.75',
    change: '-5.8%',
    changeType: 'decrease',
    icon: ArrowDownLeft,
  },
  {
    title: 'Taxable Income',
    value: '£9,359.75',
    change: '+8.1%',
    changeType: 'increase',
    icon: Banknote,
  },
  {
    title: 'Portfolio Value',
    value: '£58,920.00',
    change: '+2.5%',
    changeType: 'increase',
    icon: Landmark,
  },
];

export const misclassifiedTransactions: Transaction[] = [
  { id: 'TXN007', date: '2024-02-05', type: 'Gift', asset: 'DOGE', quantity: 10000, price: 0.08, fee: 0, value: 800, exchange: 'Self-custody', classification: 'Gift Received' },
  { id: 'TXN011', date: '2024-03-15', type: 'Buy', asset: 'USDC', quantity: 1000, price: 1, fee: 1, value: 1000, exchange: 'Coinbase', classification: 'Transfer' },
];
