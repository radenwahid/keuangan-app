export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
  onboardingDone?: boolean;
  provider?: 'local' | 'google';  // metode registrasi
  googleId?: string;               // Google sub ID, untuk cek duplikat
}

export type WalletType = 'cash' | 'bank';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  note: string;
  date: string;
  walletType: WalletType;
  toWalletType?: WalletType; // hanya untuk type === 'transfer'
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'info';
  read: boolean;
  createdAt: string;
  transactionId?: string;
}
