

import type { Transaction, StatCardData, ClassificationResult, User, Wallet } from './types';
import { ArrowUpRight, ArrowDownLeft, Banknote, Landmark } from 'lucide-react';

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

export const transactions: Transaction[] = [
  { id: 'TXN001', date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, value: 17000, exchange: 'Coinbase', classification: 'Capital Purchase' },
  { id: 'TXN002', date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, value: 4000, exchange: 'Binance', classification: 'Capital Disposal' },
  { id: 'TXN003', date: '2023-12-01', type: 'Staking', asset: 'ADA', quantity: 500, price: 0.35, fee: 0, value: 175, exchange: 'Kraken', classification: 'Income' },
  { id: 'TXN004', date: '2023-12-25', type: 'Airdrop', asset: 'JTO', quantity: 100, price: 2.50, fee: 0, value: 250, exchange: 'Self-custody', classification: 'Income' },
  { id: 'TXN005', date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, value: 950, exchange: 'Coinbase', classification: 'Capital Purchase' },
  { id: 'TXN006', date: '2024-01-20', type: 'Sell', asset: 'BTC', quantity: 0.1, price: 42000, fee: 10, value: 4200, exchange: 'Binance', classification: 'Capital Disposal' },
  { id: 'TXN007', date: '2024-02-05', type: 'Gift', asset: 'DOGE', quantity: 10000, price: 0.08, fee: 0, value: 800, exchange: 'Self-custody', classification: 'Gift Received' },
  { id: 'TXN008', date: '2024-02-14', type: 'Staking', asset: 'ETH', quantity: 0.1, price: 2800, fee: 0, value: 280, exchange: 'Coinbase', classification: 'Income' },
  { id: 'TXN009', date: '2024-03-01', type: 'Buy', asset: 'LINK', quantity: 20, price: 18, fee: 2, value: 360, exchange: 'Kraken', classification: 'Capital Purchase' },
  { id: 'TXN010', date: '2024-03-12', type: 'Sell', asset: 'ADA', quantity: 500, price: 0.7, fee: 1, value: 350, exchange: 'Kraken', classification: 'Capital Disposal' },
];

export const misclassifiedTransactions: Transaction[] = [
  transactions[6], // Gift Received -> Income
  { id: 'TXN011', date: '2024-03-15', type: 'Buy', asset: 'USDC', quantity: 1000, price: 1, fee: 1, value: 1000, exchange: 'Coinbase', classification: 'Transfer' },
];

export const users: User[] = [
    {
        id: 'user-dev',
        name: 'Admin',
        email: 'admin@cryptotaxpro.com',
        role: 'Developer',
        passwordHash: 'hashed_admin_password',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin@cryptotaxpro.com',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'user-client-1',
        name: 'Satoshi Nakamoto',
        email: 'satoshi@gmx.com',
        role: 'Client',
        passwordHash: 'hashed_client_password',
        avatarUrl: 'https://i.pravatar.cc/150?u=satoshi@gmx.com',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'user-consultant-1',
        name: 'Charles Hoskinson',
        email: 'charles@iohk.io',
        role: 'TaxConsultant',
        passwordHash: 'hashed_consultant_password',
        avatarUrl: 'https://i.pravatar.cc/150?u=charles@iohk.io',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'user-staff-1',
        name: 'Vitalik Buterin',
        email: 'vitalik@ethereum.org',
        role: 'Staff',
        passwordHash: 'hashed_staff_password',
        avatarUrl: 'https://i.pravatar.cc/150?u=vitalik@ethereum.org',
        createdAt: new Date().toISOString(),
    }
];

export const wallets: Wallet[] = [
  {
    id: 'wallet-1',
    userId: 'user-client-1',
    name: 'Binance Main',
    type: 'CEX',
    provider: 'Binance',
    address: null,
    blockchain: 'BSC',
    apiKey: '...',
    apiSecret: '...',
    transactionCount: 152,
    balance: 25480.50,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-05-20T11:30:00Z',
  },
  {
    id: 'wallet-2',
    userId: 'user-client-1',
    name: 'Metamask Hot',
    type: 'Wallet',
    provider: 'MetaMask',
    address: '0x123...abc',
    blockchain: 'Ethereum',
    apiKey: null,
    apiSecret: null,
    transactionCount: 48,
    balance: 12350.00,
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2024-05-18T15:00:00Z',
  },
  {
    id: 'wallet-3',
    userId: 'user-client-1',
    name: 'Phantom Main',
    type: 'Wallet',
    provider: 'Phantom',
    address: 'So1...xyz',
    blockchain: 'Solana',
    apiKey: null,
    apiSecret: null,
    transactionCount: 89,
    balance: 8990.75,
    createdAt: '2023-05-10T10:00:00Z',
    updatedAt: '2024-05-21T09:00:00Z',
  },
    {
    id: 'wallet-4',
    userId: 'user-client-1',
    name: 'Coinbase Pro',
    type: 'CEX',
    provider: 'Coinbase',
    address: null,
    blockchain: 'Ethereum',
    apiKey: '...',
    apiSecret: '...',
    transactionCount: 210,
    balance: 18765.25,
    createdAt: '2022-11-05T10:00:00Z',
    updatedAt: '2024-05-19T18:45:00Z',
  },
];
