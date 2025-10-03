import { Transaction, TransactionFilters, TransType, Attachment } from '@/types';
import transactionsData from '@/data/transactions.json';

// In-memory store for demo - in production this would be replaced with API calls
let transactionStore: Transaction[] = [...transactionsData] as Transaction[];

// Load from localStorage on initialization (client-side only)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('transactions');
  if (stored) {
    try {
      transactionStore = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored transactions:', e);
      // Fallback to default data if localStorage is corrupted
      transactionStore = [...transactionsData] as Transaction[];
    }
  }
}

// Save to localStorage helper
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('transactions', JSON.stringify(transactionStore));
  }
};

export const financeAPI = {
  // Get all transactions with optional filtering
  list: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...transactionStore];
    
    if (filters) {
      if (filters.dateFrom) {
        filtered = filtered.filter(t => t.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(t => t.date <= filters.dateTo!);
      }
      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }
      if (filters.type) {
        filtered = filtered.filter(t => t.type === filters.type);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search)
        );
      }
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // TODO: Replace with real API call
    /*
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    
    return apiRequest<Transaction[]>(`/transactions?${params.toString()}`);
    */
  },

  // Get single transaction by ID
  getById: async (id: string): Promise<Transaction | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return transactionStore.find(t => t.id === id) || null;
    
    // TODO: Replace with real API call
    /*
    return apiRequest<Transaction>(`/transactions/${id}`);
    */
  },

  // Create new transaction
  create: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const transaction: Transaction = {
      ...data,
      id: `trans-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    transactionStore.unshift(transaction);
    saveToStorage();
    
    return transaction;
    
    // TODO: Replace with real API call
    /*
    return apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    */
  },

  // Update existing transaction
  update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = transactionStore.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const updated = {
      ...transactionStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    transactionStore[index] = updated;
    saveToStorage();
    
    return updated;
    
    // TODO: Replace with real API call
    /*
    return apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    */
  },

  // Delete transaction
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = transactionStore.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    // Clean up attachment object URLs to prevent memory leaks
    const transaction = transactionStore[index];
    transaction.attachments.forEach(att => {
      if (att.url.startsWith('blob:')) {
        URL.revokeObjectURL(att.url);
      }
    });
    
    transactionStore.splice(index, 1);
    saveToStorage();
    
    // TODO: Replace with real API call
    /*
    await apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
    */
  },

  // Get available categories
  getCategories: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const categories = Array.from(new Set(transactionStore.map(t => t.category)));
    return categories.sort();
    
    // TODO: Replace with real API call
    /*
    return apiRequest<string[]>('/transactions/categories');
    */
  },

  // Get financial summary
  getSummary: async (dateFrom?: string, dateTo?: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = transactionStore;
    
    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo);
    }
    
    const totalIncome = filtered
      .filter(t => t.type === 'MASUK')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = filtered
      .filter(t => t.type === 'KELUAR')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: filtered.length,
    };
    
    // TODO: Replace with real API call
    /*
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    return apiRequest<{
      totalIncome: number;
      totalExpense: number;
      balance: number;
      transactionCount: number;
    }>(`/transactions/summary?${params.toString()}`);
    */
  },

  // Get chart data
  getChartData: async (dateFrom?: string, dateTo?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = transactionStore;
    
    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo);
    }
    
    // Monthly balance data
    const monthlyData: Record<string, { income: number; expense: number; balance: number }> = {};
    
    filtered.forEach(transaction => {
      const monthKey = transaction.date.slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, balance: 0 };
      }
      
      if (transaction.type === 'MASUK') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });
    
    // Calculate running balance
    let runningBalance = 0;
    const balanceData = Object.keys(monthlyData)
      .sort()
      .map(month => {
        const data = monthlyData[month];
        runningBalance += data.income - data.expense;
        return {
          month,
          income: data.income,
          expense: data.expense,
          balance: runningBalance,
        };
      });
    
    // Category breakdown (expenses only)
    const categoryData: Record<string, number> = {};
    filtered
      .filter(t => t.type === 'KELUAR')
      .forEach(transaction => {
        categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
      });
    
    return {
      monthly: balanceData,
      categories: Object.entries(categoryData).map(([category, amount]) => ({
        category,
        amount,
      })),
    };
    
    // TODO: Replace with real API call
    /*
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    return apiRequest<{
      monthly: Array<{ month: string; income: number; expense: number; balance: number }>;
      categories: Array<{ category: string; amount: number }>;
    }>(`/transactions/charts?${params.toString()}`);
    */
  },
};