// API abstraction layer - exports all API services
// This layer makes it easy to swap to real backend APIs later

export { authAPI } from './auth';
export { financeAPI } from './finance';
export { membersAPI } from './members';

// Configuration for API integration
export const API_CONFIG = {
  // Current mode: 'json' for JSON files, 'api' for real backend
  MODE: process.env.NEXT_PUBLIC_API_MODE || 'json',
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds
};

// Common API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper for future use
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, error.message, error.code);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    throw new ApiError(500, 'Network error');
  }
};

// Helper function to check if we're in JSON mode
export const isJsonMode = (): boolean => {
  return API_CONFIG.MODE === 'json';
};

// Helper function to simulate API delays in JSON mode
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => {
    if (isJsonMode()) {
      setTimeout(resolve, ms);
    } else {
      resolve();
    }
  });
};

// Data persistence helper for JSON mode
export const persistData = (key: string, data: any): void => {
  if (typeof window !== 'undefined' && isJsonMode()) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to persist data for key ${key}:`, error);
    }
  }
};

// Data loading helper for JSON mode
export const loadPersistedData = <T>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined' && isJsonMode()) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.error(`Failed to load persisted data for key ${key}:`, error);
      return fallback;
    }
  }
  return fallback;
};

// Migration helper for when switching from JSON to API mode
export const migrateToApi = async (): Promise<void> => {
  if (!isJsonMode()) {
    console.log('Already in API mode, no migration needed');
    return;
  }
  
  console.log('Starting migration from JSON to API mode...');
  
  try {
    // Get all local data
    const transactions = loadPersistedData('transactions', []);
    const members = loadPersistedData('members', []);
    
    // TODO: Send data to API endpoints
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    // POST /api/migrate/transactions with transactions data
    // POST /api/migrate/members with members data
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};