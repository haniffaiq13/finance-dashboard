'use client'

import { create } from 'zustand'
import type { TransactionFilters } from '@/types'
import { financeAPI } from '@/lib/api/finance'

/**
 * Sinkronisasi tipe data backend.
 * Kita pakai ApiTransaction dari financeAPI, bukan dummy Transaction dari @/types.
 */
type Transaction = Awaited<ReturnType<typeof financeAPI.getById>> extends infer T
  ? NonNullable<T>
  : never

interface FinanceStore {
  transactions: Transaction[]
  isLoading: boolean
  filters: TransactionFilters

  // Actions
  fetchTransactions: () => Promise<void>
  setFilters: (filters: TransactionFilters) => void
  createTransaction: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Transaction>
  updateTransaction: (
    id: string,
    data: Partial<Transaction>
  ) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
  resetFilters: () => void
}

const initialFilters: TransactionFilters = {}

export const useFinance = create<FinanceStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  filters: initialFilters,

  fetchTransactions: async () => {
    set({ isLoading: true })
    try {
      const filters = get().filters
      const transactions = await financeAPI.list({
        ...filters,
        limit: 100,
        offset: 0,
      })
      set({ transactions, isLoading: false })
    } catch (err) {
      console.error('❌ fetchTransactions error:', err)
      set({ isLoading: false })
    }
  },

  setFilters: (filters: TransactionFilters) => {
    set({ filters })
    // langsung refetch setelah filter berubah
    void get().fetchTransactions()
  },

  createTransaction: async (data) => {
    try {
      const transaction = await financeAPI.create(data)
      // push langsung ke state tanpa refetch total
      set({ transactions: [transaction, ...get().transactions] })
      return transaction
    } catch (err) {
      console.error('❌ createTransaction error:', err)
      throw err
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const updated = await financeAPI.update(id, data)
      const updatedList = get().transactions.map((t) =>
        t.id === id ? updated : t
      )
      set({ transactions: updatedList })
      return updated
    } catch (err) {
      console.error('❌ updateTransaction error:', err)
      throw err
    }
  },

  deleteTransaction: async (id) => {
    try {
      await financeAPI.delete(id)
      const remain = get().transactions.filter((t) => t.id !== id)
      set({ transactions: remain })
    } catch (err) {
      console.error('❌ deleteTransaction error:', err)
      throw err
    }
  },

  resetFilters: () => {
    set({ filters: initialFilters })
    void get().fetchTransactions()
  },
}))
