import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  isOffline: !navigator.onLine,
  setOffline: (value) => set({ isOffline: value }),
}))
