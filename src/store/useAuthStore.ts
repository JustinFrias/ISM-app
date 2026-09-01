import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { mockUsers } from '../services/mockData';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (username, password) => {
        // Mock auth — admin/admin1234 or staff01/staff1234
        const CREDENTIALS: Record<string, string> = {
          'admin': 'admin1234',
          'superadmin': 'admin1234',
          'staff01': 'staff1234',
          'staff02': 'staff1234',
          'staff03': 'staff1234',
        };
        if (!CREDENTIALS[username]) {
          return { success: false, error: 'Username not found.' };
        }
        if (CREDENTIALS[username] !== password) {
          return { success: false, error: 'Incorrect password.' };
        }
        const user = mockUsers.find(u => u.username === username);
        if (!user) return { success: false, error: 'User not found.' };
        if (!user.isActive) return { success: false, error: 'Account is disabled.' };

        set({ currentUser: { ...user, lastLogin: new Date().toISOString() }, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'skeuo-auth-store' }
  )
);
