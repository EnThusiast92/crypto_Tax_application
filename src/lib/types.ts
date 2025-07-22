

import type { Timestamp } from 'firebase/firestore';

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

export type Invitation = {
  id: string;
  fromClientId: string;
  toConsultantEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// RBAC and Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Timestamp | string; // Allow string for local object, but Timestamp for Firestore
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
  isFirebaseReady: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterFormValues) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  updateUserRole: (userId: string, newRole: Role) => void;
  deleteUser: (userId:string) => void;
  updateUser: (userId: string, data: EditUserFormValues) => void;
  removeConsultantAccess: (clientId: string) => void;
  sendInvitation: (consultantEmail: string) => void;
  acceptInvitation: (invitationId: string) => void;
  rejectInvitation: (invitationId: string) => void;
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
  updateFeatureToggle: (key: keyof FeatureToggles, value: boolean) => void;
  updateSiteConfig: (key: keyof SiteConfig, value: string) => void;
  updateStaffPermission: (key: keyof StaffPermissions, value: boolean) => void;
};
