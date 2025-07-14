

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

export interface AddTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTransaction: (data: Omit<Transaction, 'id' | 'value'>) => void;
}

export type WalletProvider = 'Binance' | 'Coinbase' | 'Kraken' | 'MetaMask' | 'Phantom';
export type Blockchain = 'Bitcoin' | 'Ethereum' | 'BSC' | 'Solana' | 'Polygon';

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  type: "CEX" | "Wallet";
  provider: WalletProvider;
  address: string | null;
  blockchain: Blockchain;
  apiKey: string | null;
  apiSecret: string | null;
  transactionCount: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
};


// RBAC and Auth Types
export type Role = 'Developer' | 'Staff' | 'Client' | 'TaxConsultant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string; // This would not be sent to the client in a real app
  avatarUrl?: string;
  createdAt: string;
}

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  role: 'Client' | 'TaxConsultant';
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterFormValues) => Promise<User>;
};
