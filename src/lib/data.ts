
import type { Transaction, User, StatCardData, StaticWallet, Holding } from './types';
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


export const popularWallets: StaticWallet[] = [
  { name: 'Binance', iconUrl: 'https://i.imgur.com/4E23bHl.png', supported: true },
  { name: 'Coinbase', iconUrl: 'https://i.imgur.com/Y1sV52I.png', supported: true },
  { name: 'KuCoin', iconUrl: 'https://i.imgur.com/gmt1Sfs.png', supported: true },
  { name: 'Ledger', iconUrl: 'https://i.imgur.com/kS9vX0u.png', supported: false },
  { name: 'MetaMask', iconUrl: 'https://i.imgur.com/sC5w22I.png', supported: true },
  { name: 'Kraken (API Keys)', iconUrl: 'https://i.imgur.com/D4JcIeW.png', supported: true },
  { name: 'Crypto.com', iconUrl: 'https://i.imgur.com/AG49tY2.png', supported: true },
  { name: 'Revolut', iconUrl: 'https://i.imgur.com/G2k3UVs.png', supported: false },
  { name: 'Phantom', iconUrl: 'https://i.imgur.com/nL9v9x8.png', supported: true },
  { name: 'Crypto.com App', iconUrl: 'https://i.imgur.com/AG49tY2.png', supported: false },
  { name: 'ByBit', iconUrl: 'https://i.imgur.com/Qj0sI0G.png', supported: false },
  { name: 'MEXC', iconUrl: 'https://i.imgur.com/Ie159Tk.png', supported: false },
];

export const allWallets: StaticWallet[] = [
    ...popularWallets,
    { name: 'Binance US', iconUrl: 'https://i.imgur.com/4E23bHl.png', supported: true },
    { name: 'CoinSpot', iconUrl: 'https://i.imgur.com/9i4sChs.png', supported: false },
    { name: 'Swyftx', iconUrl: 'https://i.imgur.com/vB1Lw2h.png', supported: false },
    { name: 'Cointree', iconUrl: 'https://i.imgur.com/i9z7wQs.png', supported: false },
    { name: 'BTC Markets', iconUrl: 'https://i.imgur.com/9v6Z3ZO.png', supported: false },
    { name: 'CoinJar', iconUrl: 'https://i.imgur.com/b24GmGr.png', supported: false },
    { name: 'Nexo', iconUrl: 'https://i.imgur.com/sZ4sX4q.png', supported: false },
    { name: 'NDAX', iconUrl: 'https://i.imgur.com/5J3s4Jk.png', supported: false },
    { name: 'Newton', iconUrl: 'https://i.imgur.com/p1s4pBw.png', supported: false },
    { name: 'Netcoins', iconUrl: 'https://i.imgur.com/8F9QZ9n.png', supported: false },
    { name: 'Bitbuy', iconUrl: 'https://i.imgur.com/J8V4dJ0.png', supported: false },
    { name: 'Coinsquare', iconUrl: 'https://i.imgur.com/O4hX7lG.png', supported: false },
    { name: 'Bittrex', iconUrl: 'https://i.imgur.com/y3o4gL9.png', supported: false },
    { name: 'Gemini', iconUrl: 'https://i.imgur.com/P1i1Y0C.png', supported: false },
].filter((wallet, index, self) => 
    index === self.findIndex((w) => (w.name === wallet.name))
); // Remove duplicates


export const portfolioChartData = [
  { name: 'Jan', value: 90000 },
  { name: 'Feb', value: 110000 },
  { name: 'Mar', value: 105000 },
  { name: 'Apr', value: 120000 },
  { name: 'May', value: 130000 },
  { name: 'Jun', value: 125000 },
  { name: 'Jul', value: 140000 },
  { name: 'Aug', value: 150000 },
  { name: 'Sep', value: 145000 },
  { name: 'Oct', value: 155000 },
  { name: 'Nov', value: 170000 },
  { name: 'Dec', value: 160168 },
];

const generateSparkline = () => Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));

export const holdings: Holding[] = [
  {
    asset: 'BTC',
    balance: 1.4537,
    cost: 71259,
    marketValue: 126834,
    roi: 0.7799,
    hasIssue: false,
    chartData: generateSparkline(),
  },
  {
    asset: 'SOL',
    balance: 242.3503,
    cost: 31764,
    marketValue: 33323,
    roi: 0.0491,
    hasIssue: true,
    chartData: generateSparkline(),
  },
  {
    asset: 'ETH',
    balance: 0.0025,
    cost: 5,
    marketValue: 7,
    roi: 0.4257,
    hasIssue: false,
    chartData: generateSparkline(),
  },
  {
    asset: 'MATIC',
    balance: 19.6985,
    cost: 22,
    marketValue: 3,
    roi: -0.8451,
    hasIssue: false,
    chartData: generateSparkline(),
  },
  {
    asset: 'USDC',
    balance: 0.6983,
    cost: 1,
    marketValue: 1,
    roi: -0.0189,
    hasIssue: false,
    chartData: generateSparkline(),
  },
];
