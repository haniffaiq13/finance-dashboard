import { Member, Role } from '@/types';
import membersData from '@/data/members.json';

// In-memory store for demo - in production this would be replaced with API calls
let memberStore: Member[] = [...membersData] as Member[];

// Load from localStorage on initialization (client-side only)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('members');
  if (stored) {
    try {
      memberStore = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored members:', e);
      // Fallback to default data if localStorage is corrupted
      memberStore = [...membersData] as Member[];
    }
  }
}

// Save to localStorage helper
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('members', JSON.stringify(memberStore));
  }
};

export const membersAPI = {
  // Get all members
  list: async (): Promise<Member[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    return [...memberStore].sort((a, b) =>
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );

    // TODO: Replace with real API call
    /*
    return apiRequest<Member[]>('/members');
    */
  },

  // Get single member by ID
  getById: async (id: string): Promise<Member | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    return memberStore.find(m => m.id === id) || null;

    // TODO: Replace with real API call
    /*
    return apiRequest<Member>(`/members/${id}`);
    */
  },

  // Create new member
  create: async (data: Omit<Member, 'id' | 'joinedAt'>): Promise<Member> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (memberStore.find(m => m.email === data.email)) {
      throw new Error('Email already exists');
    }

    const member: Member = {
      ...data,
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      joinedAt: new Date().toISOString(),
    };

    memberStore.unshift(member);
    saveToStorage();

    return member;

    // TODO: Replace with real API call
    /*
    return apiRequest<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    */
  },

  // Update existing member
  update: async (id: string, data: Partial<Member>): Promise<Member> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const index = memberStore.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Member not found');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== memberStore[index].email) {
      if (memberStore.find(m => m.email === data.email && m.id !== id)) {
        throw new Error('Email already exists');
      }
    }

    const updated = {
      ...memberStore[index],
      ...data,
    };

    memberStore[index] = updated;
    saveToStorage();

    return updated;

    // TODO: Replace with real API call
    /*
    return apiRequest<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    */
  },

  // Delete member
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = memberStore.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Member not found');
    }

    memberStore.splice(index, 1);
    saveToStorage();

    // TODO: Replace with real API call
    /*
    await apiRequest(`/members/${id}`, {
      method: 'DELETE',
    });
    */
  },

  // Get member statistics
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const total = memberStore.length;
    const active = memberStore.filter(m => m.status === 'AKTIF').length;
    const inactive = memberStore.filter(m => m.status === 'NONAKTIF').length;

    const roleBreakdown: Record<Role, number> = {
      admin: memberStore.filter(m => m.role === 'admin').length,
      finance: memberStore.filter(m => m.role === 'finance').length,
      writer: memberStore.filter(m => m.role === 'writer').length,
      user: memberStore.filter(m => m.role === 'user').length,
    };

    return {
      total,
      active,
      inactive,
      roleBreakdown,
    };

    // TODO: Replace with real API call
    /*
    return apiRequest<{
      total: number;
      active: number;
      inactive: number;
      roleBreakdown: Record<Role, number>;
    }>('/members/stats');
    */
  },
};