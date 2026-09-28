import { create } from 'zustand'
import { DSA_SYLLABUS } from '@/data/dsaSyllabusData'

export const useDsaLabStore = create((set, get) => ({
  activeTopicId: 'binary-search-mastery',
  selectedCategory: 'All Categories',
  priorityFilter: 'All',
  searchQuery: '',
  activeViewMode: 'split', // 'split' | 'visualize' | 'learn' | 'practice' | 'playground'
  cameraPreset: 'perspective', // 'perspective' | 'top' | 'isometric'

  // Execution Step State
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1, // 0.25, 0.5, 1, 2, 4
  customInput: null,
  totalSteps: 1,

  // Actions
  setActiveTopicId: (id) => {
    set({
      activeTopicId: id,
      currentStepIndex: 0,
      isPlaying: false,
      customInput: null,
    })
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  setTotalSteps: (total) => {
    set((s) => ({
      totalSteps: total,
      currentStepIndex: Math.min(s.currentStepIndex, Math.max(0, total - 1)),
    }))
  },

  setCurrentStepIndex: (index) => {
    const { totalSteps } = get()
    const clamped = Math.max(0, Math.min(index, totalSteps - 1))
    set({ currentStepIndex: clamped })
  },

  stepForward: () => {
    const { currentStepIndex, totalSteps } = get()
    if (currentStepIndex < totalSteps - 1) {
      set({ currentStepIndex: currentStepIndex + 1 })
    } else {
      set({ isPlaying: false })
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 })
    }
  },

  togglePlay: () => {
    const { isPlaying, currentStepIndex, totalSteps } = get()
    if (!isPlaying && currentStepIndex >= totalSteps - 1) {
      // Loop or restart from step 0
      set({ currentStepIndex: 0, isPlaying: true })
    } else {
      set({ isPlaying: !isPlaying })
    }
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCustomInput: (input) => set({ customInput: input, currentStepIndex: 0, isPlaying: false }),
  resetPlayback: () => set({ currentStepIndex: 0, isPlaying: false }),

  // Helper selector for active topic
  getActiveTopic: () => {
    const { activeTopicId } = get()
    return DSA_SYLLABUS.find((t) => t.id === activeTopicId) || DSA_SYLLABUS[0]
  },
}))
