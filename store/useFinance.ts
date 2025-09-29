'use client';

import { create } from 'zustand';
import { Transaction, TransactionFilters } from '@/types';
import { financeAPI } from '@/lib/api';

interface FinanceStore {
  transactions: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  
  // Actions
  fetchTransactions: () => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  resetFilters: () => void;
}

const initialFilters: TransactionFilters = {};

export const useFinance = create<FinanceStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  filters: initialFilters,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const transactions = await financeAPI.list(get().filters);
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: TransactionFilters) => {
    set({ filters });
    get().fetchTransactions();
  },

  createTransaction: async (data) => {
    const transaction = await financeAPI.create(data);
    
    // Refresh transactions to get updated list
    get().fetchTransactions();
    
    return transaction;
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    const updated = await financeAPI.update(id, data);
    
    // Update local state
    const transactions = get().transactions.map(t => 
      t.id === id ? updated : t
    );
    set({ transactions });
    
    return updated;
  },

  deleteTransaction: async (id: string) => {
    await financeAPI.delete(id);
    
    // Remove from local state
    const transactions = get().transactions.filter(t => t.id !== id);
    set({ transactions });
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchTransactions();
  },
}));