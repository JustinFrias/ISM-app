import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ActivityLog, ActivityActionType, UserRole } from '../types';
import { mockActivityLogs } from '../services/mockData';

interface AuditStore {
  logs: ActivityLog[];
  addLog: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  resetToEmpty: () => void;
  seedDemoData: () => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (entry) => set(state => ({
        logs: [{ ...entry, id: uuidv4(), timestamp: new Date().toISOString() }, ...state.logs],
      })),
      clearLogs: () => set({ logs: [] }),
      resetToEmpty: () => set({ logs: [] }),
      seedDemoData: () => set({ logs: mockActivityLogs }),
    }),
    { name: 'ism-audit-store-v2' }
  )
);

// Helper hook for easily logging actions
export const useAuditLogger = () => {
  const addLog = useAuditStore(s => s.addLog);
  return (
    userId: string,
    userName: string,
    userRole: UserRole,
    action: ActivityActionType,
    entityName: string,
    entityId: string,
    description: string,
    payload?: Record<string, unknown>
  ) => addLog({ userId, userName, userRole, action, entityName, entityId, description, payload });
};
