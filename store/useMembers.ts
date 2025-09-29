'use client';

import { create } from 'zustand';
import { Member } from '@/types';
import { membersAPI } from '@/lib/api';

interface MembersStore {
  members: Member[];
  isLoading: boolean;
  
  // Actions
  fetchMembers: () => Promise<void>;
  createMember: (data: Omit<Member, 'id' | 'joinedAt'>) => Promise<Member>;
  updateMember: (id: string, data: Partial<Member>) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
}

export const useMembers = create<MembersStore>((set, get) => ({
  members: [],
  isLoading: false,

  fetchMembers: async () => {
    set({ isLoading: true });
    try {
      const members = await membersAPI.list();
      set({ members, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createMember: async (data) => {
    const member = await membersAPI.create(data);
    
    // Add to local state
    const members = [member, ...get().members];
    set({ members });
    
    return member;
  },

  updateMember: async (id: string, data: Partial<Member>) => {
    const updated = await membersAPI.update(id, data);
    
    // Update local state
    const members = get().members.map(m => 
      m.id === id ? updated : m
    );
    set({ members });
    
    return updated;
  },

  deleteMember: async (id: string) => {
    await membersAPI.delete(id);
    
    // Remove from local state
    const members = get().members.filter(m => m.id !== id);
    set({ members });
  },
}));