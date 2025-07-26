
import type { Timestamp } from 'firebase/firestore';

export type Role = 'Developer' | 'Staff' | 'Client' | 'TaxConsultant';

export type WalletType = 'DEX' | 'CEX';
export type WalletStatus = 'connected' | 'syncing' | 'synced' | 'sync_failed';

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  identifier: string; // Public address or API key
  reportedBalance: number;
  transactionsCount: number;
  lastSyncAt: Timestamp;
  createdAt: Timestamp;
  status: WalletStatus;
};

export type StaticWallet = {
    name: string;
    iconUrl: string;
    supported: boolean;
}

export type AddWalletFormValues = {
  name: string;
  type: WalletType;
  publicAddress?: string;
  apiKey?: string;
  apiSecret?: string;
}

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
  walletId?: string; // Link transaction to a specific wallet
};

export type Holding = {
  asset: string;
  balance: number;
  cost: number;
  marketValue: number;
  roi: number;
  hasIssue: boolean;
  chartData: { value: number }[];
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

export type Invitation = {
  id: string;
  fromClientId: string;
  toConsultantEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

// RBAC and Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  role: Role;
  linkedClientIds: string[]; // For consultants
  linkedConsultantId: string; // For clients
}

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  isTaxConsultant?: boolean;
};

export type EditUserFormValues = {
  name: string;
  email: string;
};

export type AuthContextType = {
  user: User | null;
  users: User[];
  invitations: Invitation[];
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (data: RegisterFormValues) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  updateUserRole: (userId: string, newRole: Role) => void;
  deleteUser: (userId:string) => void;
  updateUser: (userId: string, data: EditUserFormValues) => void;
  removeConsultantAccess: (clientId: string) => void;
  sendInvitation: (consultantEmail: string) => void;
  acceptInvitation: (invitationId: string) => void;
  rejectInvitation: (invitationId: string) => void;
  cancelInvitation: (invitationId: string) => void;
};


// Admin Dashboard Types
export type FeatureToggles = {
    csvImport: boolean;
    taxReport: boolean;
    apiSync: boolean;
};

export type StaffPermissions = {
    canManageUsers: boolean;
    canViewAllTx: boolean;
};

export type SiteConfig = {
    logoUrl: string;
    taxRules: string;
};

export type AppSettings = {
    toggles: FeatureToggles;
    permissions: StaffPermissions;
    config: SiteConfig;
};

export type SettingsContextType = {
  settings: AppSettings;
  loading: boolean;
  updateFeatureToggle: (key: keyof FeatureToggles, value: boolean) => void;
  updateSiteConfig: (key: keyof SiteConfig, value: string) => void;
  updateStaffPermission: (key: keyof StaffPermissions, value: boolean) => void;
};

export type WalletsContextType = {
  wallets: Wallet[];
  loading: boolean;
  addWallet: (newWalletData: AddWalletFormValues) => Promise<void>;
};
