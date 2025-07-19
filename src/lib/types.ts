
export type Role = 'Developer' | 'Staff' | 'Client' | 'TaxConsultant';

export type Transaction = {
  id: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Staking' | 'Airdrop' | 'Gift' | 'Swap';
  asset: string;
  quantity: number;
  price: number;
  fee: number;
  value: number;
  exchange: 'Binance' | 'Coinbase' | 'Kraken' | 'Self-custody';
  classification: string;
  toAsset?: string;
  toQuantity?: number;
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


// RBAC and Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // This would not be sent to the client in a real app
  avatarUrl?: string;
  createdAt: string;
  role: Role;
}

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  isTaxConsultant?: boolean;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterFormValues) => Promise<User>;
};
