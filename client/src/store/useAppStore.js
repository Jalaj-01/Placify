import { create } from 'zustand'

const getInitialTheme = () => {
  const saved = localStorage.getItem('placify_theme')
  if (saved) return saved
  return 'dark'
}

export const useAppStore = create((set) => ({
  sidebarCollapsed: true, // Default to compact icon sidebar for clean spacious layout
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  isOffline: !navigator.onLine,
  setOffline: (value) => set({ isOffline: value }),
  
  // Theme State (Dark / Light)
  theme: getInitialTheme(),
  toggleTheme: () => set((s) => {
    const nextTheme = s.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('placify_theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    return { theme: nextTheme }
  }),

  // Right Slide-Over AI Coach Panel State
  aiCoachOpen: false,
  openAICoach: () => set({ aiCoachOpen: true, sidebarCollapsed: true }),
  closeAICoach: () => set({ aiCoachOpen: false }),
  toggleAICoach: () => set((s) => ({ aiCoachOpen: !s.aiCoachOpen, sidebarCollapsed: true })),
}))
