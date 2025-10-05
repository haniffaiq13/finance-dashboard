export type Role = 'admin' | 'finance' | 'writer' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

export type TransType = 'MASUK' | 'KELUAR';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransType;
  amount: number;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'AKTIF' | 'NONAKTIF';
  joinedAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  type?: TransType;
  search?: string;
}

export type Permission = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type Resource = 'TRANSACTION' | 'MEMBER' | 'CHART' | 'EXPORT';