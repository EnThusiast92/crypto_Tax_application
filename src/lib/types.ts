export type Transaction = {
  id: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Staking' | 'Airdrop' | 'Gift';
  asset: string;
  quantity: number;
  price: number;
  fee: number;
  value: number;
  exchange: 'Binance' | 'Coinbase' | 'Kraken' | 'Self-custody';
  classification: string;
};

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
};

export type ClassificationResult = {
  transaction: Transaction;
  isMisclassified: boolean;
  suggestedClassification: string;
  confidence: number;
};
