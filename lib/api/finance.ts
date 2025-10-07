// /lib/financeAPI.ts
// Client nyata ke Go CRUD Starter - Transactions (SELALU pakai Bearer)

import { Transaction, TransactionFilters } from '@/types';
import { authAPI } from '@/lib/api/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://katar.haniffaiq.com';
const DEFAULT_LIMIT = 100;

type ListResponse<T> = { items: T[]; limit: number; offset: number };

type ListParams = {
  limit?: number;
  offset?: number;
} & Partial<TransactionFilters>;

type ApiTransaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'MASUK' | 'KELUAR';
  amount: number;
  attachments: Array<{ name: string; url: string }>;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ===== auth helpers (WAJIB token) =====
function ensureToken(): string {
  const token = authAPI.getToken?.();
  if (!token) {
    // konsekuen: FE lo harus trigger login flow ketika kena ini
    throw new Error('Unauthorized: token tidak ditemukan. Silakan login dulu.');
  }
  return token;
}

function withAuthHeaders(init?: RequestInit): RequestInit {
  const token = ensureToken();
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  };
}

// ============ util fetch kecil, dengan timeout, error surfacing ============
async function apiRequest<T>(path: string, init?: RequestInit, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...withAuthHeaders(init), // <— SELALU inject Bearer
      signal: controller.signal,
    });

    // Tangani 401 tegas
    if (res.status === 401) {
      const body = await res.text().catch(() => '');
      // optional: authAPI.logout(); // kalau mau auto-kick
      throw new Error(`Unauthorized (401). ${body}`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    }

    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

// ============ helpers ============
function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== '') q.set(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : '';
}

function applyClientFilters(list: ApiTransaction[], filters?: TransactionFilters): ApiTransaction[] {
  if (!filters) return list;
  let arr = [...list];

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    arr = arr.filter(t => new Date(t.date).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    arr = arr.filter(t => new Date(t.date).getTime() <= to);
  }
  if (filters.category) {
    arr = arr.filter(t => t.category === filters.category);
  }
  if (filters.type) {
    arr = arr.filter(t => t.type === filters.type);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    arr = arr.filter(
      t =>
        t.description.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s)
    );
  }
  return arr;
}

// ============ API ============
export const financeAPI = {
  async list(params?: ListParams): Promise<ApiTransaction[]> {
    const qp = toQuery({
      limit: params?.limit ?? DEFAULT_LIMIT,
      offset: params?.offset ?? 0,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      category: params?.category,
      type: params?.type,
      search: params?.search,
    });

    const resp = await apiRequest<ListResponse<ApiTransaction>>(`/v1/transactions${qp}`);
    const items = Array.isArray(resp?.items) ? resp.items : [];
    const filtered = applyClientFilters(items, params);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getById(id: string): Promise<ApiTransaction | null> {
    const data = await apiRequest<ApiTransaction>(`/v1/transactions/${id}`);
    return data ?? null;
  },

  async create(input: Omit<ApiTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiTransaction> {
    const body = JSON.stringify(input);
    return apiRequest<ApiTransaction>('/v1/transactions', { method: 'POST', body });
  },

  async update(id: string, patch: Partial<ApiTransaction>): Promise<ApiTransaction> {
    const body = JSON.stringify(patch);
    return apiRequest<ApiTransaction>(`/v1/transactions/${id}`, { method: 'PUT', body });
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/v1/transactions/${id}`, { method: 'DELETE' });
  },

  async getCategories(): Promise<string[]> {
    const items = await this.list({ limit: DEFAULT_LIMIT, offset: 0 });
    return Array.from(new Set(items.map(t => t.category))).sort();
  },

  async getSummary(dateFrom?: string, dateTo?: string) {
    const items = await this.list({ dateFrom, dateTo, limit: DEFAULT_LIMIT, offset: 0 });
    const totalIncome = items.filter(t => t.type === 'MASUK').reduce((s, t) => s + t.amount, 0);
    const totalExpense = items.filter(t => t.type === 'KELUAR').reduce((s, t) => s + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: items.length,
    };
  },

  async getChartData(dateFrom?: string, dateTo?: string) {
    const items = await this.list({ dateFrom, dateTo, limit: DEFAULT_LIMIT, offset: 0 });

    const monthly: Record<string, { income: number; expense: number }> = {};
    for (const t of items) {
      const key = new Date(t.date).toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
      if (t.type === 'MASUK') monthly[key].income += t.amount;
      else monthly[key].expense += t.amount;
    }

    let running = 0;
    const monthlyArr = Object.keys(monthly)
      .sort()
      .map(m => {
        running += monthly[m].income - monthly[m].expense;
        return { month: m, income: monthly[m].income, expense: monthly[m].expense, balance: running };
      });

    const cat: Record<string, number> = {};
    for (const t of items) {
      if (t.type === 'KELUAR') cat[t.category] = (cat[t.category] ?? 0) + t.amount;
    }

    return {
      monthly: monthlyArr,
      categories: Object.entries(cat).map(([category, amount]) => ({ category, amount })),
    };
  },
};
