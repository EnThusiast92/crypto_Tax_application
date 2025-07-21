
import type { Transaction, User, Invitation } from './types';
import { ArrowUpRight, ArrowDownLeft, Banknote, Landmark } from 'lucide-react';
import { db } from './firebase';
import { collection, writeBatch, doc, Timestamp, setDoc } from 'firebase/firestore';

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

export const transactions: Omit<Transaction, 'id'>[] = [
  { date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, value: 17000, exchange: 'Coinbase', classification: 'Capital Purchase' },
  { date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, value: 4000, exchange: 'Binance', classification: 'Capital Disposal' },
  { date: '2023-12-01', type: 'Staking', asset: 'ADA', quantity: 500, price: 0.35, fee: 0, value: 175, exchange: 'Kraken', classification: 'Income' },
  { date: '2023-12-25', type: 'Airdrop', asset: 'JTO', quantity: 100, price: 2.50, fee: 0, value: 250, exchange: 'Self-custody', classification: 'Income' },
  { date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, value: 950, exchange: 'Coinbase', classification: 'Capital Purchase' },
  { date: '2024-01-20', type: 'Sell', asset: 'BTC', quantity: 0.1, price: 42000, fee: 10, value: 4200, exchange: 'Binance', classification: 'Capital Disposal' },
  { date: '2024-02-05', type: 'Gift', asset: 'DOGE', quantity: 10000, price: 0.08, fee: 0, value: 800, exchange: 'Self-custody', classification: 'Gift Received' },
  { date: '2024-02-14', type: 'Staking', asset: 'ETH', quantity: 0.1, price: 2800, fee: 0, value: 280, exchange: 'Coinbase', classification: 'Income' },
  { date: '2024-03-01', type: 'Buy', asset: 'LINK', quantity: 20, price: 18, fee: 2, value: 360, exchange: 'Kraken', classification: 'Capital Purchase' },
  { date: '2024-03-12', type: 'Sell', asset: 'ADA', quantity: 500, price: 0.7, fee: 1, value: 350, exchange: 'Kraken', classification: 'Capital Disposal' },
];

export const misclassifiedTransactions: Transaction[] = [
  { id: 'TXN007', date: '2024-02-05', type: 'Gift', asset: 'DOGE', quantity: 10000, price: 0.08, fee: 0, value: 800, exchange: 'Self-custody', classification: 'Gift Received' },
  { id: 'TXN011', date: '2024-03-15', type: 'Buy', asset: 'USDC', quantity: 1000, price: 1, fee: 1, value: 1000, exchange: 'Coinbase', classification: 'Transfer' },
];

const now = Timestamp.now();

export const users: Omit<User, 'id'>[] = [
    {
        name: 'Admin',
        email: 'admin@cryptotaxpro.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin@cryptotaxpro.com',
        createdAt: now,
        role: 'Developer',
        linkedClientIds: [],
        linkedConsultantId: '',
    },
    {
        name: 'Satoshi Nakamoto',
        email: 'satoshi@gmx.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=satoshi@gmx.com',
        createdAt: now,
        role: 'Client',
        linkedConsultantId: 'user-charles',
        linkedClientIds: [],
    },
     {
        name: 'Gavin Wood',
        email: 'gavin@eth.org',
        avatarUrl: 'https://i.pravatar.cc/150?u=gavin@eth.org',
        createdAt: now,
        role: 'Client',
        linkedConsultantId: '',
        linkedClientIds: [],
    },
    {
        name: 'Charles Hoskinson',
        email: 'charles@iohk.io',
        avatarUrl: 'https://i.pravatar.cc/150?u=charles@iohk.io',
        createdAt: now,
        role: 'TaxConsultant',
        linkedClientIds: ['user-satoshi'],
        linkedConsultantId: '',
    },
     {
        name: 'Hayden Adams',
        email: 'hayden@uniswap.org',
        avatarUrl: 'https://i.pravatar.cc/150?u=hayden@uniswap.org',
        createdAt: now,
        role: 'TaxConsultant',
        linkedClientIds: [],
        linkedConsultantId: '',
    },
    {
        name: 'Vitalik Buterin',
        email: 'vitalik@ethereum.org',
        avatarUrl: 'https://i.pravatar.cc/150?u=vitalik@ethereum.org',
        createdAt: now,
        role: 'Staff',
        linkedClientIds: [],
        linkedConsultantId: '',
    }
];

export const invitations: Invitation[] = [
    {
        id: 'inv-1',
        fromClientId: 'user-gavin',
        toConsultantEmail: 'hayden@uniswap.org',
        status: 'pending'
    }
];


export async function seedDatabase() {
  try {
    console.log('🟡 Seeding started...');
    
    // Use a map to get the auto-generated IDs
    const userIds: Record<string, string> = {};
    users.forEach((user, index) => {
        // Create a predictable ID based on the email for linking purposes
        const userId = `user-${user.email.split('@')[0]}`;
        userIds[index] = userId;
    })

    // Step 1: Seed users and invitations
    const batch1 = writeBatch(db);
    const usersCol = collection(db, 'users');
    const invitationsCol = collection(db, 'invitations');

    users.forEach((user, index) => {
      const userId = userIds[index];
      const userRef = doc(usersCol, userId);
      
      const userData: any = {...user};
      // Make sure linkings are correct using the generated IDs
      if(user.email === 'satoshi@gmx.com') {
          const consultantIndex = users.findIndex(u => u.email === 'charles@iohk.io');
          userData.linkedConsultantId = userIds[consultantIndex];
      }
      if(user.email === 'charles@iohk.io') {
          const clientIndex = users.findIndex(u => u.email === 'satoshi@gmx.com');
          userData.linkedClientIds = [userIds[clientIndex]];
      }

      batch1.set(userRef, userData);
    });

    invitations.forEach(inv => {
      const fromClientIndex = users.findIndex(u => u.email === 'gavin@eth.org');
      const fromClientId = userIds[fromClientIndex];
      const invitationRef = doc(invitationsCol, inv.id);
      batch1.set(invitationRef, {...inv, fromClientId });
    });

    await batch1.commit();
    console.log('✅ Users and invitations seeded');

    // Step 2: Seed transactions for satoshi
    const satoshiIndex = users.findIndex(u => u.email === 'satoshi@gmx.com');
    const satoshiId = userIds[satoshiIndex];
    const txCol = collection(db, `users/${satoshiId}/transactions`);
    const batch2 = writeBatch(db);

    transactions.forEach(tx => {
      const txRef = doc(txCol); // auto-id
      batch2.set(txRef, tx);
    });

    await batch2.commit();
    console.log('✅ Transactions seeded');

    console.log('🎉 All data seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}
