// 'use client';

// import { create } from 'zustand';
// import { User, AuthSession } from '@/types';
// import { getStoredSession, storeSession } from '@/lib/auth';
// import { authAPI } from '@/lib/api';

// interface SessionStore extends AuthSession {
//   login: (email: string, password: string) => Promise<void>;
//   register: (name: string, email: string, password: string, role: User['role']) => Promise<void>;
//   logout: () => void;
//   initialize: () => void;
//   isLoading: boolean;
// }

// export const useSession = create<SessionStore>((set, get) => ({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,

//   initialize: () => {
//     const session = getStoredSession();
//     set({ 
//       ...session, 
//       isLoading: false 
//     });
//   },

//   login: async (email: string, password: string) => {
//     try {
//       const result = await authAPI.login(email, password);

//       const session = { user: result.user, token: result.token, isAuthenticated: true };
//       storeSession(result);
//       set(session);
//     } catch (error) {
//       throw error;
//     }
//   },

//   register: async (name: string, email: string, password: string, role: User['role']) => {
//     try {
//       const result = await authAPI.register(name, email, password, role);

//       const session = { user: result.user, token: result.token, isAuthenticated: true };
//       storeSession(result);
//       set(session);
//     } catch (error) {
//       throw error;
//     }
//   },

//   logout: () => {
//     authAPI.logout();
//     set({ 
//       user: null, 
//       token: null, 
//       isAuthenticated: false 
//     });
//   },
// }));

// // Initialize session on store creation
// if (typeof window !== 'undefined') {
//   useSession.getState().initialize();
// }

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api/auth';
import type { User } from '@/types';
import { getStoredSession, storeSession } from '@/lib/auth';


type SessionState = {
  // state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true saat rehydrate

  // actions
  login: (email: string, password: string) => Promise<void>;
  setSession: (user: User | null, token: string | null) => void;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<void>;
  logout: () => void;
};

// Simpan hanya field ini di storage
const partialize = (state: SessionState) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
});

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // ====== ACTIONS ======

      // Login: call BE, simpan token+user, update state
      async login(email: string, password: string) {
        const { user, token } = await authAPI.login(email, password);
        // authAPI.login() sudah menyimpan token ke storage (via authAPI)
        set({
          user: user ?? null,
          token: token ?? null,
          isAuthenticated: !!token,
          isLoading: false,
        });
      },

      // Manual set session (kalau mau dipakai dari tempat lain)
      setSession(user: User | null, token: string | null) {
        set({
          user,
          token,
          isAuthenticated: !!token,
          isLoading: false,
        });
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

      // Logout total
      logout() {
        authAPI.logout(); // bersihin token di semua media (local/session/cookie)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'session-storage',
      partialize,
      onRehydrateStorage: () => (state, error) => {
        // Setelah rehydrate selesai, pastikan flag loading = false
        // dan sync isAuthenticated sesuai token.
        // NOTE: `state` di sini adalah snapshot yang datang dari storage.
        // Kita tidak dapat `set` langsung di argumen ini, jadi pakai microtask:
        queueMicrotask(() => {
          const s = (state as unknown as SessionState) || get();
          const hasToken = !!s?.token;
          // Update store saat runtime
          // @ts-ignore - akses internal zustand
          const api = (useSession as any).getState ? (useSession as any) : null;
          api?.setState?.({
            isAuthenticated: hasToken,
            isLoading: false,
          });
        });
      },
    }
  )
);
