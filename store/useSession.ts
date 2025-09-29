'use client';

import { create } from 'zustand';
import { User, AuthSession } from '@/types';
import { getStoredSession, storeSession } from '@/lib/auth';
import { authAPI } from '@/lib/api';

interface SessionStore extends AuthSession {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  isLoading: boolean;
}

export const useSession = create<SessionStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const session = getStoredSession();
    set({ 
      ...session, 
      isLoading: false 
    });
  },

  login: async (email: string, password: string) => {
    try {
      const result = await authAPI.login(email, password);
      
      const session = { user: result.user, token: result.token, isAuthenticated: true };
      storeSession(result);
      set(session);
    } catch (error) {
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: User['role']) => {
    try {
      const result = await authAPI.register(name, email, password, role);
      
      const session = { user: result.user, token: result.token, isAuthenticated: true };
      storeSession(result);
      set(session);
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
}));

// Initialize session on store creation
if (typeof window !== 'undefined') {
  useSession.getState().initialize();
}