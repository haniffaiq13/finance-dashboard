import { User, AuthSession } from '@/types';
import usersData from '@/data/users.json';

const STORAGE_KEY = 'internal_auth_session';

// Simple mock hash function - DO NOT use in production
const mockHash = (password: string): string => {
  return `$2a$10$hash_${password.length}_${password.slice(0, 3)}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
  return mockHash(password) === hash;
};

// Mock JWT token creation - simplified base64 encoding
const createToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    
    // Find user by id
    const user = usersData.find(u => u.id === payload.id) as User;
    return user || null;
  } catch {
    return null;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = usersData.find(u => u.email === email) as User;
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null;
    }
    
    const token = createToken(user);
    return { user, token };
  },

  register: async (name: string, email: string, password: string, role: User['role']): Promise<{ user: User; token: string } | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email already exists
    if (usersData.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      passwordHash: mockHash(password),
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, this would persist to database
    // For demo purposes, we'll add to in-memory store
    usersData.push(user as any);
    
    const token = createToken(user);
    return { user, token };
  },

  getCurrentUser: (): User | null => {
    const session = getStoredSession();
    if (!session.token) return null;
    
    return verifyToken(session.token);
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const getStoredSession = (): AuthSession => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { user: null, token: null, isAuthenticated: false };
    }
    
    const session = JSON.parse(stored);
    const user = verifyToken(session.token);
    
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return { user: null, token: null, isAuthenticated: false };
    }
    
    return { user, token: session.token, isAuthenticated: true };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

export const storeSession = (session: { user: User; token: string }): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

// Demo credentials for testing
export const DEMO_CREDENTIALS = [
  { email: 'bendahara@internal.id', password: 'password123', role: 'BENDAHARA' },
  { email: 'sekretaris@internal.id', password: 'password123', role: 'SEKRETARIS' },
  { email: 'anggota1@internal.id', password: 'password123', role: 'ANGGOTA' }
] as const;