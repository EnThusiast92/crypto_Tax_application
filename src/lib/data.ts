
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

export async function seedDatabase() {
  try {
    console.log('🟡 Seeding started...');
    const batch = writeBatch(db);

    // --- Users Collection ---
    const usersCol = collection(db, 'users');

    // 1. Developer User
    const devUserRef = doc(usersCol, 'user-dev-admin');
    batch.set(devUserRef, {
        name: 'Admin Developer',
        email: 'admin@taxwise.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin@taxwise.com',
        createdAt: Timestamp.now(),
        role: 'Developer',
        linkedClientIds: [],
        linkedConsultantId: '',
    });

    // 2. Client User
    const clientUserRef = doc(usersCol, 'user-client-satoshi');
    batch.set(clientUserRef, {
        name: 'Satoshi Nakamoto',
        email: 'satoshi@gmx.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=satoshi@gmx.com',
        createdAt: Timestamp.now(),
        role: 'Client',
        linkedClientIds: [],
        linkedConsultantId: '',
    });

    // 3. Tax Consultant User
    const consultantUserRef = doc(usersCol, 'user-consultant-charles');
    batch.set(consultantUserRef, {
        name: 'Charles Hoskinson',
        email: 'charles@iohk.io',
        avatarUrl: 'https://i.pravatar.cc/150?u=charles@iohk.io',
        createdAt: Timestamp.now(),
        role: 'TaxConsultant',
        linkedClientIds: [],
        linkedConsultantId: '',
    });

    // --- Transactions Subcollection for Client ---
    const transactionsCol = collection(db, `users/${clientUserRef.id}/transactions`);
    
    const sampleTransactions: Omit<Transaction, 'id'>[] = [
        { date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, value: 17000, exchange: 'Coinbase', classification: 'Capital Purchase' },
        { date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, value: 4000, exchange: 'Binance', classification: 'Capital Disposal' },
        { date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, value: 950, exchange: 'Coinbase', classification: 'Capital Purchase' },
    ];

    sampleTransactions.forEach(tx => {
        const txRef = doc(transactionsCol);
        batch.set(txRef, tx);
    });

    await batch.commit();
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}
