import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Boxes, BookOpen, Code2, Play, Sparkles, Filter, Search,
  ChevronRight, ChevronLeft, Layers, MonitorPlay, Terminal,
  ArrowLeft, CheckCircle2, Database, Compass, HelpCircle,
  LayoutGrid, Wrench, Bug, Check, Lightbulb, Film
} from 'lucide-react'
import { useDsaLabStore } from '@/store/useDsaLabStore'
import { DSA_SYLLABUS, DSA_CATEGORIES, PRIORITY_LEVELS } from '@/data/dsaSyllabusData'
import { generateAlgorithmSteps } from '@/components/dsa/engine/AlgorithmStepEngine'

import DsaCanvas3D from '@/components/dsa/visualizer/DsaCanvas3D'
import CodeVisualizerPanel from '@/components/dsa/code/CodeVisualizerPanel'
import LiveInteractiveCodeStudio from '@/components/dsa/code/LiveInteractiveCodeStudio'
import Dsa3DVideoTutorial from '@/components/dsa/tutorials/Dsa3DVideoTutorial'
import PlaybackControls from '@/components/dsa/controls/PlaybackControls'
import TheoryLearnPanel from '@/components/dsa/learn/TheoryLearnPanel'
import PracticeProblemsPanel from '@/components/dsa/practice/PracticeProblemsPanel'

export default function DsaLab() {
  const { topicId: urlTopicId } = useParams()
  const navigate = useNavigate()

  // Zustand store state
  const activeTopicId = useDsaLabStore((s) => s.activeTopicId)
  const setActiveTopicId = useDsaLabStore((s) => s.setActiveTopicId)
  const selectedCategory = useDsaLabStore((s) => s.selectedCategory)
  const setSelectedCategory = useDsaLabStore((s) => s.setSelectedCategory)
  const priorityFilter = useDsaLabStore((s) => s.priorityFilter)
  const setPriorityFilter = useDsaLabStore((s) => s.setPriorityFilter)
  const searchQuery = useDsaLabStore((s) => s.searchQuery)
  const setSearchQuery = useDsaLabStore((s) => s.setSearchQuery)

  const activeViewMode = useDsaLabStore((s) => s.activeViewMode)
  const setActiveViewMode = useDsaLabStore((s) => s.setActiveViewMode)

  const currentStepIndex = useDsaLabStore((s) => s.currentStepIndex)
  const setTotalSteps = useDsaLabStore((s) => s.setTotalSteps)
  const customInput = useDsaLabStore((s) => s.customInput)
  const setCustomInput = useDsaLabStore((s) => s.setCustomInput)

  const togglePlay = useDsaLabStore((s) => s.togglePlay)
  const stepForward = useDsaLabStore((s) => s.stepForward)
  const stepBackward = useDsaLabStore((s) => s.stepBackward)
  const resetPlayback = useDsaLabStore((s) => s.resetPlayback)

  // Hub vs Studio display state
  const [showHub, setShowHub] = useState(() => !urlTopicId)
  const [hubFilter, setHubFilter] = useState('all')
  const [activeSubtopic, setActiveSubtopic] = useState(null)
  const [studioCodeMode, setStudioCodeMode] = useState('visualizer') // 'visualizer' | 'interactive_code'

  // URL sync
  useEffect(() => {
    if (urlTopicId) {
      const match = DSA_SYLLABUS.find((t) => t.id === urlTopicId || String(t.topicNumber) === urlTopicId)
      if (match) {
        setActiveTopicId(match.id)
        setShowHub(false)
      }
    }
  }, [urlTopicId, setActiveTopicId])

  // Active topic object
  const activeTopic = useMemo(() => {
    return DSA_SYLLABUS.find((t) => t.id === activeTopicId) || DSA_SYLLABUS[0]
  }, [activeTopicId])

  // Reset active subtopic when topic changes
  useEffect(() => {
    if (activeTopic?.subtopics?.length > 0) {
      setActiveSubtopic(activeTopic.subtopics[0])
    } else {
      setActiveSubtopic(null)
    }
  }, [activeTopic])

  // Sorted list of topics
  const sortedSyllabus = useMemo(() => {
    return [...DSA_SYLLABUS].sort((a, b) => a.topicNumber - b.topicNumber)
  }, [])

  // Filtered topics for the Launchpad Hub
  const hubTopics = useMemo(() => {
    return sortedSyllabus.filter((t) => {
      if (hubFilter === 'ds_only' && !t.isDataStructure) return false
      if (hubFilter === 'algo_only' && t.isDataStructure) return false
      if (hubFilter === 'critical' && t.priority !== PRIORITY_LEVELS.CRITICAL) return false
      if (hubFilter === 'trees' && !t.category.includes('Trees') && !t.title.includes('Tree')) return false
      if (hubFilter === 'linear' && !t.category.includes('Linear')) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchSummary = t.summary.toLowerCase().includes(q)
        const matchNum = String(t.topicNumber).includes(q)
        const matchCat = t.category.toLowerCase().includes(q)
        const matchSub = t.subtopics?.some((sub) => sub.toLowerCase().includes(q))
        return matchTitle || matchSummary || matchNum || matchCat || matchSub
      }
      return true
    })
  }, [sortedSyllabus, hubFilter, searchQuery])

  const [customLiveSimulation, setCustomLiveSimulation] = useState(null)

  // Generate deterministic step sequence (with override for live user code simulation)
  const steps = useMemo(() => {
    if (customLiveSimulation?.steps?.length > 0) {
      return customLiveSimulation.steps
    }
    return generateAlgorithmSteps(activeTopic.id, customInput, activeSubtopic)
  }, [activeTopic.id, customInput, activeSubtopic, customLiveSimulation])

  // Sync total steps
  useEffect(() => {
    setTotalSteps(steps.length)
  }, [steps, setTotalSteps])

  const currentStep = steps[currentStepIndex] || steps[0]

  // Subtopic selection handler
  const handleSelectSubtopic = (sub) => {
    setActiveSubtopic(sub)
    setCustomLiveSimulation(null)
    resetPlayback()
  }

  // Topic navigation
  const handleSelectTopic = (topic) => {
    setActiveTopicId(topic.id)
    setCustomLiveSimulation(null)
    setShowHub(false)
  }

  const currentTopicIdx = sortedSyllabus.findIndex((t) => t.id === activeTopic.id)
  const handlePrevTopic = () => {
    if (currentTopicIdx > 0) {
      setActiveTopicId(sortedSyllabus[currentTopicIdx - 1].id)
      setCustomLiveSimulation(null)
    }
  }
  const handleNextTopic = () => {
    if (currentTopicIdx < sortedSyllabus.length - 1) {
      setActiveTopicId(sortedSyllabus[currentTopicIdx + 1].id)
      setCustomLiveSimulation(null)
    }
  }

  // Handle live custom code execution from LiveInteractiveCodeStudio
  const handleLiveCodeExecution = (simulationPayload) => {
    if (!simulationPayload) return

    // If direct array passed (legacy backward compat)
    if (Array.isArray(simulationPayload)) {
      const is2D = Array.isArray(simulationPayload[0])
      setCustomLiveSimulation({
        type: is2D ? 'array_2d' : 'array_1d',
        table: is2D ? simulationPayload : undefined,
        array: !is2D ? simulationPayload : undefined,
        steps: [
          {
            lineNumber: 1,
            lineCode: '// Live Code Output Simulation',
            variables: { length: simulationPayload.length },
            sceneState: {
              type: is2D ? 'array_2d' : 'array_1d',
              table: is2D ? simulationPayload : undefined,
              array: !is2D ? simulationPayload : undefined,
              activeCell: is2D ? [0, 0] : undefined,
              pointers: !is2D ? [{ name: 'HEAD', index: 0, color: '#3b82f6' }] : undefined,
            },
            callStack: ['custom_code()'],
            explanation: `Rendered ${is2D ? '2D Matrix Grid' : '1D Array'} from your code execution.`,
          },
        ],
      })
    } else if (simulationPayload.steps) {
      setCustomLiveSimulation(simulationPayload)
    }

    resetPlayback()
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (showHub) return
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        stepForward()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        stepBackward()
      } else if (e.key === 'r' || e.key === 'R') {
        resetPlayback()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showHub, togglePlay, stepForward, stepBackward, resetPlayback])

  // =========================================================================
  // VIEW 1: STARTING LAUNCHPAD / HUB ("What would you like to study today?")
  // =========================================================================
  if (showHub) {
    return (
      <div className="space-y-6 pb-16">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/25 text-accent-light text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Interactive DSA Laboratory • Structured Master Syllabus</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight leading-snug">
              What would you like to <span className="text-accent-light">study today?</span>
            </h1>

            <p className="text-secondary text-text-secondary leading-relaxed text-sm sm:text-base">
              Master fundamental to advanced Data Structures with structured subtopics and interactive 3D WebGL scenes.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-text-muted">
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm">
                <Boxes className="w-4 h-4 text-accent" />
                <strong className="text-text-primary">{sortedSyllabus.length}</strong> Core Topics
              </span>
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm">
                <Database className="w-4 h-4 text-cyan-400" />
                <strong className="text-text-primary">
                  {sortedSyllabus.filter((t) => t.isDataStructure).length}
                </strong> Data Structures
              </span>
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm">
                <Layers className="w-4 h-4 text-purple-400" />
                <strong className="text-text-primary">100+</strong> Interactive Subtopics
              </span>
            </div>
          </div>
        </div>

        {/* Search & Fast Track Filters */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search data structures, subtopics (e.g., Arrays, BST, Heap, Trie)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent shadow-inner"
              />
            </div>

            {/* Resume Button */}
            <button
              onClick={() => setShowHub(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-light text-xs font-bold shadow-md shadow-accent/20 transition-all shrink-0"
            >
              <span>Resume 3D Studio (#{activeTopic.topicNumber})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-subtle/60">
            {[
              { id: 'all', label: `All Topics (${sortedSyllabus.length})` },
              { id: 'ds_only', label: `🧱 Data Structures (${sortedSyllabus.filter(t => t.isDataStructure).length})` },
              { id: 'linear', label: 'Linear Structures' },
              { id: 'trees', label: 'Trees & Hierarchical' },
              { id: 'critical', label: 'Core Interview Priority' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setHubFilter(id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  hubFilter === id
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Topic Cards Grid with Nested Subtopics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-card-title font-bold text-text-primary">
              Structured Topics & Subtopics ({hubTopics.length})
            </h2>
            <span className="text-xs text-text-muted">Click any topic to explore and visualize in 3D</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hubTopics.map((topic) => {
              const isSelected = topic.id === activeTopic.id

              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-surface border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-accent ring-1 ring-accent/30 bg-accent/5'
                      : 'border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-card border border-border-subtle text-[11px] font-mono font-black text-accent-light">
                          #{topic.topicNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            topic.isDataStructure
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                          }`}
                        >
                          {topic.isDataStructure ? 'Data Structure' : 'Algorithm'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent-light border border-accent/20">
                          {topic.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            topic.difficulty === 'Easy'
                              ? 'text-semantic-green bg-semantic-green/10'
                              : topic.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-400/10'
                              : 'text-semantic-red bg-semantic-red/10'
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-accent-light transition-colors leading-snug break-words">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>

                    {/* Structured Subtopics Badges Preview */}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          Subtopics ({topic.subtopics.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {topic.subtopics.slice(0, 4).map((sub, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-card border border-border-subtle text-[10px] text-text-secondary truncate max-w-[150px]"
                            >
                              {sub}
                            </span>
                          ))}
                          {topic.subtopics.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-card text-[10px] text-text-muted">
                              +{topic.subtopics.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Launch Footer */}
                  <div className="pt-3 mt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
                    <span className="text-text-muted text-[11px] font-medium truncate max-w-[180px]">
                      {topic.category}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:text-accent-light group-hover:translate-x-0.5 transition-all shrink-0">
                      <span>Launch 3D</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: ACTIVE 3D STUDIO WORKSPACE
  // =========================================================================
  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Navigation Bar (Fully responsive, no overflow clipping) */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Study Hub button & Title */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <button
              onClick={() => setShowHub(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-hover border border-border-subtle text-text-primary hover:bg-card hover:border-accent/40 font-bold text-xs shadow-sm transition-all shrink-0"
              title="Return to Study Hub"
            >
              <ArrowLeft className="w-4 h-4 text-accent" />
              <span>Study Hub</span>
            </button>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-accent/15 text-accent-light text-xs font-mono font-black border border-accent/25 shrink-0">
                  #{activeTopic.topicNumber}
                </span>
                <h1 className="text-base sm:text-xl font-black text-text-primary tracking-tight break-words">
                  {activeTopic.title}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    activeTopic.isDataStructure
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                  }`}
                >
                  {activeTopic.isDataStructure ? 'Data Structure' : 'Algorithm'}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-1">
                {activeTopic.summary}
              </p>
            </div>
          </div>

          {/* Right: View Mode Tabs & Masterclass Link */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/dsa-courses')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
              title="Open full 3D Video Masterclass Academy in dedicated page"
            >
              <Film className="w-3.5 h-3.5" />
              <span>3D Masterclass Video</span>
            </button>

            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border-subtle overflow-x-auto">
              {[
                { id: 'split', label: 'Studio Split', icon: MonitorPlay },
                { id: 'visualize', label: '3D Visualizer', icon: Boxes },
                { id: 'learn', label: 'Learn (Theory)', icon: BookOpen },
                { id: 'practice', label: 'Practice Problems', icon: Code2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveViewMode(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeViewMode === id
                      ? 'bg-accent text-white shadow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-hover'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sequential Topic Selector Toolbar & Subtopics Bar */}
        <div className="pt-3 border-t border-border-subtle space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Topic Stepper Controls */}
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <button
                onClick={handlePrevTopic}
                disabled={currentTopicIdx <= 0}
                className="p-1.5 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous topic"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <select
                  value={activeTopic.id}
                  onChange={(e) => setActiveTopicId(e.target.value)}
                  className="w-full text-xs font-bold"
                >
                  {sortedSyllabus.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.topicNumber}. {t.title} ({t.isDataStructure ? 'DS' : 'Algo'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextTopic}
                disabled={currentTopicIdx >= sortedSyllabus.length - 1}
                className="p-1.5 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next topic"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher for Code Pane: Synchronized Stepper vs Live Interactive Studio */}
            {activeViewMode === 'split' && (
              <div className="flex items-center gap-1 bg-hover p-1 rounded-xl border border-border-subtle text-xs">
                <button
                  onClick={() => setStudioCodeMode('visualizer')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    studioCodeMode === 'visualizer'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Synchronized Stepper
                </button>
                <button
                  onClick={() => setStudioCodeMode('interactive_code')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    studioCodeMode === 'interactive_code'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>Live Code & Error Catcher</span>
                </button>
              </div>
            )}
          </div>

          {/* Custom User Code Active Simulation Banner */}
          {customLiveSimulation && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-accent/15 border border-accent/30 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-accent-light font-bold">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>Live Code 3D Simulation: {customLiveSimulation.type === 'array_2d' ? '3D Matrix Grid' : '1D Array Towers'}</span>
              </div>
              <button
                onClick={() => setCustomLiveSimulation(null)}
                className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-card hover:bg-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-all"
                title="Restore default topic steps"
              >
                Restore Syllabus Stepper
              </button>
            </div>
          )}

          {/* Subtopics Horizontal Pill Bar */}
          {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <span>Subtopics:</span>
              </span>
              {activeTopic.subtopics.map((sub, idx) => {
                const isActive = activeSubtopic === sub
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSubtopic(sub)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-accent text-white shadow-md shadow-accent/20 border border-accent font-bold ring-1 ring-accent'
                        : 'bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {sub}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Primary Workspace Layout */}
      {activeViewMode === 'split' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Synchronized Stepper OR Live Interactive Coding Studio (5 cols) */}
            <div className="lg:col-span-5 h-[520px]">
              {studioCodeMode === 'interactive_code' ? (
                <LiveInteractiveCodeStudio
                  activeTopic={activeTopic}
                  onExecuteCode={handleLiveCodeExecution}
                />
              ) : (
                <CodeVisualizerPanel activeTopic={activeTopic} currentStep={currentStep} />
              )}
            </div>

            {/* Right Column: 3D Interactive WebGL Canvas (7 cols) */}
            <div className="lg:col-span-7 h-[520px]">
              <DsaCanvas3D sceneState={currentStep?.sceneState} />
            </div>
          </div>

          {/* Playback HUD Bar */}
          <PlaybackControls activeTopic={activeTopic} />

          {/* Lower Split Tabs: Quick Theory & Practice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl border border-border-subtle p-2">
              <TheoryLearnPanel activeTopic={activeTopic} />
            </div>
            <div className="bg-surface rounded-2xl border border-border-subtle p-2">
              <PracticeProblemsPanel activeTopic={activeTopic} />
            </div>
          </div>
        </div>
      )}

      {activeViewMode === 'visualize' && (
        <div className="space-y-4">
          <div className="h-[620px] w-full">
            <DsaCanvas3D sceneState={currentStep?.sceneState} />
          </div>
          <PlaybackControls activeTopic={activeTopic} />
        </div>
      )}

      {activeViewMode === 'tutorials' && (
        <Dsa3DVideoTutorial
          activeTopic={activeTopic}
          steps={steps}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
          onStepChange={(idx) => useDsaLabStore.getState().setCurrentStepIndex(idx)}
        />
      )}

      {activeViewMode === 'learn' && (
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 max-w-4xl mx-auto shadow-md">
          <TheoryLearnPanel activeTopic={activeTopic} />
        </div>
      )}

      {activeViewMode === 'practice' && (
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 max-w-4xl mx-auto shadow-md">
          <PracticeProblemsPanel activeTopic={activeTopic} />
        </div>
      )}
    </div>
  )
}
