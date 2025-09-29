import { User } from '@/types';
import { authService } from '@/lib/auth';

// Authentication API abstraction
// Currently uses mock local service, easily replaceable with real API calls

export const authAPI = {
  login: async (email: string, password: string) => {
    // TODO: Replace with real API call
    /*
    return apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    */
    
    const result = await authService.login(email, password);
    if (!result) {
      throw new Error('Invalid credentials');
    }
    return result;
  },

  register: async (name: string, email: string, password: string, role: User['role']) => {
    // TODO: Replace with real API call
    /*
    return apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    */
    
    const result = await authService.register(name, email, password, role);
    if (!result) {
      throw new Error('Registration failed');
    }
    return result;
  },

  getCurrentUser: () => {
    // TODO: Replace with real API call
    /*
    return apiRequest<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    */
    
    return authService.getCurrentUser();
  },

  logout: () => {
    // TODO: Add API call to invalidate token on server
    /*
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    */
    
    authService.logout();
  },
};