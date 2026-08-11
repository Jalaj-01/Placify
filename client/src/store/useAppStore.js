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

  // Top Sticky Floating Assessment Timer Capsule State
  assessmentTimerOpen: false,
  timerSetupModalOpen: false,
  activeTimerSeconds: 45 * 60, // Default 45 mins
  openTimerSetup: () => set({ timerSetupModalOpen: true }),
  closeTimerSetup: () => set({ timerSetupModalOpen: false }),
  openAssessmentTimer: () => set({ assessmentTimerOpen: true }),
  closeAssessmentTimer: () => set({ assessmentTimerOpen: false }),
  toggleAssessmentTimer: () => set((s) => ({ assessmentTimerOpen: !s.assessmentTimerOpen })),
  startTimerWithDuration: (seconds) => {
    set({
      activeTimerSeconds: seconds,
      timerSetupModalOpen: false,
      assessmentTimerOpen: true,
    })
  },

  // Right Slide-Over Sticky Notes Drawer State
  stickyNotesOpen: false,
  openStickyNotes: () => set({ stickyNotesOpen: true, sidebarCollapsed: true }),
  closeStickyNotes: () => set({ stickyNotesOpen: false }),
  toggleStickyNotes: () => set((s) => ({ stickyNotesOpen: !s.stickyNotesOpen, sidebarCollapsed: true })),

  // Group Study Modal State
  groupStudyOpen: false,
  activeStudyRoomId: 'global-study-room',
  openGroupStudy: (roomId = 'global-study-room') => set({ groupStudyOpen: true, activeStudyRoomId: roomId }),
  closeGroupStudy: () => set({ groupStudyOpen: false }),

  // Pending Invites State
  pendingInvites: [],
  invitesDrawerOpen: false,
  toggleInvitesDrawer: () => set(s => ({ invitesDrawerOpen: !s.invitesDrawerOpen, sidebarCollapsed: true })),
  closeInvitesDrawer: () => set({ invitesDrawerOpen: false }),
  addInvite: (invite) => set((s) => ({ pendingInvites: [...s.pendingInvites, invite] })),
  removeInvite: (roomId) => set((s) => ({ pendingInvites: s.pendingInvites.filter(i => i.roomId !== roomId) })),
}))

