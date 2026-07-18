import { useState, useMemo, useEffect, useRef } from 'react'
import { BookOpen, Plus, Pencil, Check, X, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useTopics } from '@/hooks/useTopics'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import TopicChecklist from '@/components/topics/TopicChecklist'
import SubjectFilter from '@/components/topics/SubjectFilter'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { SUBJECT_LABELS } from '@/utils/topicSeeds'
import { cn } from '@/lib/utils'

export default function Topics() {
  const { user } = useAuth()
  const { topics, loading, updateTopic, addTopic, deleteTopic, deleteCategory, renameCategory, renameCustomSubject, deleteSubjectTopics, updateTabLabel, hideTab, restoreTab, profile, updateCategoryOrder } = useTopics(user?.uid)

  const [localOrders, setLocalOrders] = useState({})
  const [draggedCategory, setDraggedCategory] = useState(null)
  const [draggedSubject, setDraggedSubject] = useState(null)
  const [canDrag, setCanDrag] = useState(null)

  // Sync localOrders with profile and topics when not actively dragging
  useEffect(() => {
    if (loading || draggedCategory !== null) return

    const newOrders = {}

    // 1. DSA
    const dsaCategories = []
    topics.filter((t) => t.subject === 'DSA').forEach((t) => {
      if (!dsaCategories.includes(t.category)) dsaCategories.push(t.category)
    })
    const dsaDbOrder = profile?.categoryOrders?.['DSA'] || []
    newOrders['DSA'] = [...dsaCategories].sort((a, b) => {
      const idxA = dsaDbOrder.indexOf(a)
      const idxB = dsaDbOrder.indexOf(b)
      if (idxA === -1 && idxB === -1) return 0
      if (idxA === -1) return 1
      if (idxB === -1) return -1
      return idxA - idxB
    })

    // 2. CS Theory subjects
    const csSubjects = ['OS', 'DBMS', 'CN', 'OOPS']
    csSubjects.forEach((sub) => {
      const csCategories = []
      topics.filter((t) => t.subject === sub).forEach((t) => {
        if (!csCategories.includes(t.category)) csCategories.push(t.category)
      })
      if (csCategories.length > 0) {
        const dbOrder = profile?.categoryOrders?.[sub] || []
        newOrders[sub] = [...csCategories].sort((a, b) => {
          const idxA = dbOrder.indexOf(a)
          const idxB = dbOrder.indexOf(b)
          if (idxA === -1 && idxB === -1) return 0
          if (idxA === -1) return 1
          if (idxB === -1) return -1
          return idxA - idxB
        })
      }
    })

    // 3. Aptitude subjects
    const aptSubjects = ['Aptitude-Quant', 'Aptitude-Logical', 'Aptitude-Verbal']
    aptSubjects.forEach((sub) => {
      const aptCategories = []
      topics.filter((t) => t.subject === sub).forEach((t) => {
        if (!aptCategories.includes(t.category)) aptCategories.push(t.category)
      })
      if (aptCategories.length > 0) {
        const dbOrder = profile?.categoryOrders?.[sub] || []
        newOrders[sub] = [...aptCategories].sort((a, b) => {
          const idxA = dbOrder.indexOf(a)
          const idxB = dbOrder.indexOf(b)
          if (idxA === -1 && idxB === -1) return 0
          if (idxA === -1) return 1
          if (idxB === -1) return -1
          return idxA - idxB
        })
      }
    })

    setLocalOrders(newOrders)
  }, [topics, profile, loading, draggedCategory])

  const handleDragStart = (e, category, subject) => {
    setDraggedCategory(category)
    setDraggedSubject(subject)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, targetCategory, subject) => {
    e.preventDefault()
    if (draggedCategory === null || draggedSubject !== subject || draggedCategory === targetCategory) return

    const currentOrder = localOrders[subject] || []
    const oldIndex = currentOrder.indexOf(draggedCategory)
    const newIndex = currentOrder.indexOf(targetCategory)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newOrder = [...currentOrder]
      newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, draggedCategory)

      setLocalOrders((prev) => ({
        ...prev,
        [subject]: newOrder
      }))
    }
  }

  const handleDragEnd = async () => {
    if (draggedCategory !== null && draggedSubject !== null) {
      const finalOrder = localOrders[draggedSubject]
      if (finalOrder) {
        await updateCategoryOrder(draggedSubject, finalOrder)
      }
    }
    setDraggedCategory(null)
    setDraggedSubject(null)
    setCanDrag(null)
  }

  const handleTouchStart = (category, subject) => {
    setDraggedCategory(category)
    setDraggedSubject(subject)
    setCanDrag(category)
  }

  const handleTouchMove = (e, subject) => {
    if (draggedCategory === null || draggedSubject !== subject) return

    const touch = e.touches[0]
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!targetEl) return

    const cardEl = targetEl.closest('[data-category]')
    if (!cardEl) return

    const targetCategory = cardEl.getAttribute('data-category')
    const targetSubject = cardEl.getAttribute('data-subject')

    if (targetSubject === subject && targetCategory !== draggedCategory) {
      const currentOrder = localOrders[subject] || []
      const oldIndex = currentOrder.indexOf(draggedCategory)
      const newIndex = currentOrder.indexOf(targetCategory)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = [...currentOrder]
        newOrder.splice(oldIndex, 1)
        newOrder.splice(newIndex, 0, draggedCategory)

        setLocalOrders((prev) => ({
          ...prev,
          [subject]: newOrder
        }))
      }
    }
  }

  const handleTouchEnd = async () => {
    await handleDragEnd()
  }


  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [sectionSubject, setSectionSubject] = useState('OS')
  const [deleteConfirmSection, setDeleteConfirmSection] = useState(null)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [customSubjects, setCustomSubjects] = useState([])

  // Inline subject rename state
  const [editingSubject, setEditingSubject] = useState(null) // the subject name being edited
  const [editSubjectValue, setEditSubjectValue] = useState('')
  const subjectEditRef = useRef(null)

  useEffect(() => {
    if (editingSubject && subjectEditRef.current) {
      subjectEditRef.current.focus()
      subjectEditRef.current.select()
    }
  }, [editingSubject])

  const handleSubjectRenameConfirm = async () => {
    const trimmed = editSubjectValue.trim()
    if (!trimmed || trimmed === editingSubject) {
      setEditingSubject(null)
      return
    }
    await renameCustomSubject(editingSubject, trimmed)
    setCustomSubjects((prev) => prev.map((s) => (s === editingSubject ? trimmed : s)))
    setEditingSubject(null)
  }

  // Tab edit/delete state
  const ALL_TABS = [
    { id: 'dsa', defaultLabel: 'DSA' },
    { id: 'cs-theory', defaultLabel: 'CS Theory' },
    { id: 'aptitude', defaultLabel: 'Aptitude' },
    { id: 'custom', defaultLabel: 'Custom' },
  ]
  const TAB_SUBJECTS = {
    'dsa': ['DSA'],
    'cs-theory': ['OS', 'DBMS', 'CN', 'OOPS'],
    'aptitude': ['Aptitude-Quant', 'Aptitude-Logical', 'Aptitude-Verbal'],
    'custom': customSubjects
  }
  const hiddenTabs = profile?.hiddenTabs || []
  const visibleTabs = ALL_TABS.filter(t => !hiddenTabs.includes(t.id))
  const getTabLabel = (tabId) => (profile?.tabLabels || {})[tabId] || ALL_TABS.find(t => t.id === tabId)?.defaultLabel || tabId

  const [editingTab, setEditingTab] = useState(null)
  const [editTabValue, setEditTabValue] = useState('')
  const [deleteTabConfirm, setDeleteTabConfirm] = useState(null)
  const [showRestoreTabs, setShowRestoreTabs] = useState(false)
  const tabEditRef = useRef(null)

  useEffect(() => {
    if (editingTab && tabEditRef.current) {
      tabEditRef.current.focus()
      tabEditRef.current.select()
    }
  }, [editingTab])

  const handleTabRenameConfirm = async () => {
    const trimmed = editTabValue.trim()
    if (!trimmed || !editingTab) {
      setEditingTab(null)
      return
    }
    await updateTabLabel(editingTab, trimmed)
    setEditingTab(null)
  }

  const handleTabDelete = async (tabId) => {
    const subjects = TAB_SUBJECTS[tabId] || []
    if (subjects.length > 0) {
      await deleteSubjectTopics(subjects)
    }
    if (tabId === 'custom') {
      await updateCategoryOrder('customSubjects', [])
      setCustomSubjects([])
    }
    await hideTab(tabId)
    if (activeTab === tabId) {
      const remaining = visibleTabs.filter(t => t.id !== tabId)
      if (remaining.length > 0) setActiveTab(remaining[0].id)
    }
    setDeleteTabConfirm(null)
  }

  const handleTabRestore = async (tabId) => {
    await restoreTab(tabId)
    setShowRestoreTabs(false)
  }

  const tabTopicCount = (tabId) => {
    const subjects = TAB_SUBJECTS[tabId] || []
    return topics.filter(t => subjects.includes(t.subject)).length
  }

  const [activeTab, setActiveTab] = useState(() => {
    const hidden = []
    const first = ALL_TABS.find(t => !hidden.includes(t.id))
    return first ? first.id : 'dsa'
  })

  // Auto reset subject selection when tab changes
  useEffect(() => {
    if (activeTab === 'cs-theory') {
      setSectionSubject('OS')
    } else if (activeTab === 'aptitude') {
      setSectionSubject('Aptitude-Quant')
    } else if (activeTab === 'custom') {
      setSectionSubject(customSubjects.length > 0 ? customSubjects[0] : '')
    } else {
      setSectionSubject('DSA')
    }
  }, [activeTab, customSubjects])

  // Load custom subjects from profile
  useEffect(() => {
    if (profile?.customSubjects) {
      setCustomSubjects(profile.customSubjects)
    }
  }, [profile])

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return
    const sub = activeTab === 'dsa' ? 'DSA' : sectionSubject
    await addTopic({
      name: 'Placeholder Topic (Click to edit)',
      subject: sub,
      category: newSectionName.trim(),
      status: 'Not Started',
      confidence: 'Low'
    })
    setNewSectionName('')
    setShowAddSection(false)
  }

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return
    const updatedCustomSubjects = [...customSubjects, newSubjectName.trim()]
    await updateCategoryOrder('customSubjects', updatedCustomSubjects)
    setCustomSubjects(updatedCustomSubjects)
    setNewSubjectName('')
    setShowAddSubject(false)
  }

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Helper to filter individual topics
  const filterTopic = (t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  }

  // Group topics based on the active tab
  const groupedData = useMemo(() => {
    if (loading) return {}

    if (activeTab === 'dsa') {
      const dsaTopics = topics.filter((t) => t.subject === 'DSA')
      const groups = {}
      dsaTopics.forEach((t) => {
        if (!groups[t.category]) groups[t.category] = []
        groups[t.category].push(t)
      })

      const order = localOrders['DSA'] || []
      const sortedGroups = {}
      const sortedKeys = Object.keys(groups).sort((a, b) => {
        const idxA = order.indexOf(a)
        const idxB = order.indexOf(b)
        if (idxA === -1 && idxB === -1) return 0
        if (idxA === -1) return 1
        if (idxB === -1) return -1
        return idxA - idxB
      })
      sortedKeys.forEach((k) => {
        sortedGroups[k] = groups[k]
      })
      return sortedGroups
    }

    if (activeTab === 'cs-theory') {
      const csSubjects = ['OS', 'DBMS', 'CN', 'OOPS']
      const groups = {}
      csSubjects.forEach((sub) => {
        const subTopics = topics.filter((t) => t.subject === sub)
        if (subTopics.length > 0) {
          groups[sub] = {}
          subTopics.forEach((t) => {
            if (!groups[sub][t.category]) groups[sub][t.category] = []
            groups[sub][t.category].push(t)
          })

          const order = localOrders[sub] || []
          const sortedCategories = {}
          const sortedKeys = Object.keys(groups[sub]).sort((a, b) => {
            const idxA = order.indexOf(a)
            const idxB = order.indexOf(b)
            if (idxA === -1 && idxB === -1) return 0
            if (idxA === -1) return 1
            if (idxB === -1) return -1
            return idxA - idxB
          })
          sortedKeys.forEach((k) => {
            sortedCategories[k] = groups[sub][k]
          })
          groups[sub] = sortedCategories
        }
      })
      return groups
    }

    if (activeTab === 'aptitude') {
      const aptSubjects = ['Aptitude-Quant', 'Aptitude-Logical', 'Aptitude-Verbal']
      const groups = {}
      aptSubjects.forEach((sub) => {
        const subTopics = topics.filter((t) => t.subject === sub)
        if (subTopics.length > 0) {
          groups[sub] = {}
          subTopics.forEach((t) => {
            if (!groups[sub][t.category]) groups[sub][t.category] = []
            groups[sub][t.category].push(t)
          })

          const order = localOrders[sub] || []
          const sortedCategories = {}
          const sortedKeys = Object.keys(groups[sub]).sort((a, b) => {
            const idxA = order.indexOf(a)
            const idxB = order.indexOf(b)
            if (idxA === -1 && idxB === -1) return 0
            if (idxA === -1) return 1
            if (idxB === -1) return -1
            return idxA - idxB
          })
          sortedKeys.forEach((k) => {
            sortedCategories[k] = groups[sub][k]
          })
          groups[sub] = sortedCategories
        }
      })
      return groups
    }

    if (activeTab === 'custom') {
      const groups = {}
      customSubjects.forEach((sub) => {
        const subTopics = topics.filter((t) => t.subject === sub)
        if (subTopics.length > 0) {
          groups[sub] = {}
          subTopics.forEach((t) => {
            if (!groups[sub][t.category]) groups[sub][t.category] = []
            groups[sub][t.category].push(t)
          })

          const order = localOrders[sub] || []
          const sortedCategories = {}
          const sortedKeys = Object.keys(groups[sub]).sort((a, b) => {
            const idxA = order.indexOf(a)
            const idxB = order.indexOf(b)
            if (idxA === -1 && idxB === -1) return 0
            if (idxA === -1) return 1
            if (idxB === -1) return -1
            return idxA - idxB
          })
          sortedKeys.forEach((k) => {
            sortedCategories[k] = groups[sub][k]
          })
          groups[sub] = sortedCategories
        }
      })
      return groups
    }

    return {}
  }, [topics, activeTab, loading, localOrders, customSubjects])

  // Overall calculations for progress meters
  const progressStats = useMemo(() => {
    if (loading || !topics.length) return { dsa: 0, cs: 0, apt: 0, custom: 0 }

    const dsa = topics.filter((t) => t.subject === 'DSA')
    const cs = topics.filter((t) => ['OS', 'DBMS', 'CN', 'OOPS'].includes(t.subject))
    const apt = topics.filter((t) => t.subject.startsWith('Aptitude-'))
    const custom = topics.filter((t) => customSubjects.includes(t.subject))

    const getPct = (list) => {
      if (!list.length) return 0
      const done = list.filter((t) => t.status === 'Done').length
      return Math.round((done / list.length) * 100)
    }

    return {
      dsa: getPct(dsa),
      cs: getPct(cs),
      apt: getPct(apt),
      custom: getPct(custom),
    }
  }, [topics, loading, customSubjects])

  const handleUpdate = async (topicId, data) => {
    await updateTopic(topicId, data)
  }

  const handleAddCustom = async (subject, category, name) => {
    await addTopic({
      name,
      subject,
      category,
      status: 'Not Started',
      confidence: 'Low',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <BookOpen className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary">Topics</h1>
            <p className="text-secondary text-text-secondary">Master key concepts across DSA, CS subjects, and Aptitude</p>
          </div>
        </div>

        {/* Global Progress Metrics */}
        <div className="grid grid-cols-4 gap-4 w-full md:w-auto md:min-w-[400px] bg-card p-3 rounded-card border border-border-subtle">
          <div className="text-center">
            <p className="text-micro text-text-muted">DSA</p>
            <p className="text-card-title font-bold text-accent-light">{progressStats.dsa}%</p>
          </div>
          <div className="text-center border-l border-border-subtle">
            <p className="text-micro text-text-muted">CS Theory</p>
            <p className="text-card-title font-bold text-semantic-purple">{progressStats.cs}%</p>
          </div>
          <div className="text-center border-l border-border-subtle">
            <p className="text-micro text-text-muted">Aptitude</p>
            <p className="text-card-title font-bold text-semantic-green">{progressStats.apt}%</p>
          </div>
          <div className="text-center border-l border-border-subtle">
            <p className="text-micro text-text-muted">Custom</p>
            <p className="text-card-title font-bold text-semantic-orange">{progressStats.custom}%</p>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <Tabs value={activeTab} onValueChange={(val) => { if (!editingTab) setActiveTab(val) }} className="w-full">
        <div className="flex gap-2 items-center mb-6">
          <TabsList
            className="flex-1 bg-surface p-1 border border-border-subtle"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}
          >
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="relative group/tab">
                {editingTab === tab.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                    <input
                      ref={tabEditRef}
                      value={editTabValue}
                      onChange={e => setEditTabValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleTabRenameConfirm()
                        if (e.key === 'Escape') setEditingTab(null)
                      }}
                      className="w-full bg-transparent text-xs font-medium text-center focus:outline-none border-b border-accent text-text-primary"
                    />
                    <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); handleTabRenameConfirm() }} className="p-0.5 rounded text-semantic-green hover:bg-semantic-green/10 shrink-0">
                      <Check className="h-3 w-3" />
                    </button>
                    <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setEditingTab(null) }} className="p-0.5 rounded text-text-muted hover:bg-hover shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 justify-center">
                    {getTabLabel(tab.id)}
                    <span className="inline-flex items-center gap-0.5 opacity-0 group-hover/tab:opacity-100 transition-opacity ml-0.5">
                      <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); setEditingTab(tab.id); setEditTabValue(getTabLabel(tab.id)) }}
                        className="p-0.5 rounded hover:bg-hover text-text-muted hover:text-accent-light transition-colors"
                        title="Rename tab"
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); setDeleteTabConfirm(tab.id) }}
                        className="p-0.5 rounded hover:bg-hover text-text-muted hover:text-semantic-red transition-colors"
                        title="Delete tab"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {hiddenTabs.length > 0 && (
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRestoreTabs(!showRestoreTabs)}
                className="h-8 w-8 p-0 bg-elevated border border-border-subtle text-text-muted hover:text-accent-light hover:bg-hover"
                title="Restore hidden tabs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              {showRestoreTabs && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border-subtle rounded-lg shadow-lg p-2 min-w-[150px] animate-fade-in">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1.5 px-1">Restore Tab</p>
                  {hiddenTabs.map(tabId => {
                    const tab = ALL_TABS.find(t => t.id === tabId)
                    return (
                      <button
                        key={tabId}
                        onClick={() => handleTabRestore(tabId)}
                        className="w-full text-left px-2 py-1.5 text-xs text-text-primary rounded hover:bg-hover transition-colors"
                      >
                        {tab?.defaultLabel || tabId}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      {/* Filters */}
      <SubjectFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Add Custom Section / Category */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          {!showAddSection ? (
            <Button
              size="sm"
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1.5 text-xs py-1.5 h-auto bg-elevated border border-border text-text-primary hover:bg-hover"
              variant="outline"
            >
              <Plus className="h-4 w-4 text-accent-light" /> Add Section
            </Button>
          ) : null}

          {activeTab === 'custom' && !showAddSubject && (
            <Button
              size="sm"
              onClick={() => setShowAddSubject(true)}
              className="flex items-center gap-1.5 text-xs py-1.5 h-auto bg-elevated border border-border text-text-primary hover:bg-hover"
              variant="outline"
            >
              <Plus className="h-4 w-4 text-accent-light" /> Add Subject
            </Button>
          )}
        </div>
        {/* Changed the ? to && here */}
        {showAddSection && (
          <div className="w-full bg-card p-4 rounded-card border border-border-subtle space-y-3 animate-fade-in">
            <h3 className="text-body font-semibold text-text-primary">Create New Section / Category</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Section Name (e.g. Segment Trees, Graph Traversals)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="flex-1 text-xs"
              />

              {activeTab === 'cs-theory' && (
                <select
                  value={sectionSubject}
                  onChange={(e) => setSectionSubject(e.target.value)}
                  className="bg-surface border border-border-subtle rounded-md text-xs px-3 py-2 outline-none text-text-primary shrink-0"
                >
                  <option value="OS">OS</option>
                  <option value="DBMS">DBMS</option>
                  <option value="CN">CN</option>
                  <option value="OOPS">OOPS</option>
                </select>
              )}

              {activeTab === 'aptitude' && (
                <select
                  value={sectionSubject}
                  onChange={(e) => setSectionSubject(e.target.value)}
                  className="bg-surface border border-border-subtle rounded-md text-xs px-3 py-2 outline-none text-text-primary shrink-0"
                >
                  <option value="Aptitude-Quant">Aptitude-Quant</option>
                  <option value="Aptitude-Logical">Aptitude-Logical</option>
                  <option value="Aptitude-Verbal">Aptitude-Verbal</option>
                </select>
              )}

              {activeTab === 'custom' && (
                <select
                  value={sectionSubject}
                  onChange={(e) => setSectionSubject(e.target.value)}
                  className="bg-surface border border-border-subtle rounded-md text-xs px-3 py-2 outline-none text-text-primary shrink-0"
                >
                  {customSubjects.length > 0 ? (
                    customSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  ) : (
                    <option value="">No custom subjects</option>
                  )}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <Button size="sm" variant="ghost" onClick={() => { setShowAddSection(false); setNewSectionName(''); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddSection} disabled={!newSectionName.trim()}>
                Create Section
              </Button>
            </div>
          </div>
        )}

        {showAddSubject && (
          <div className="w-full bg-card p-4 rounded-card border border-border-subtle space-y-3 animate-fade-in">
            <h3 className="text-body font-semibold text-text-primary">Create New Subject</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Subject Name (e.g. Mechanical Engineering, Civil Engineering)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="flex-1 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <Button size="sm" variant="ghost" onClick={() => { setShowAddSubject(false); setNewSubjectName(''); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddSubject} disabled={!newSubjectName.trim()}>
                Create Subject
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Checklist Section */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'dsa' && (
            Object.entries(groupedData).map(([category, list]) => {
              const filteredList = list.filter(filterTopic)
              if (filteredList.length === 0 && search) return null
              return (
                <div
                  key={category}
                  data-category={category}
                  data-subject="DSA"
                  draggable={canDrag === category}
                  onDragStart={(e) => handleDragStart(e, category, 'DSA')}
                  onDragOver={(e) => handleDragOver(e, category, 'DSA')}
                  onDragEnd={handleDragEnd}
                  onTouchMove={(e) => handleTouchMove(e, 'DSA')}
                  onTouchEnd={handleTouchEnd}
                  className={cn(
                    "transition-all duration-200",
                    draggedCategory === category && draggedSubject === 'DSA' && "opacity-45 scale-[0.98] border border-dashed border-accent-light rounded-card"
                  )}
                >
                  <TopicChecklist
                    title={category}
                    topics={filteredList}
                    onUpdate={handleUpdate}
                    onAdd={(name) => handleAddCustom('DSA', category, name)}
                    onDelete={deleteTopic}
                    onDeleteCategory={setDeleteConfirmSection}
                    onRenameCategory={renameCategory}
                    onDragHandleMouseDown={() => setCanDrag(category)}
                    onDragHandleMouseUp={() => setCanDrag(null)}
                    onDragHandleTouchStart={() => handleTouchStart(category, 'DSA')}
                    onDragHandleTouchEnd={handleTouchEnd}
                  />
                </div>
              )
            })
          )}

          {activeTab === 'cs-theory' && (
            Object.entries(groupedData).map(([subject, categories]) => {
              const matchesAny = Object.values(categories).some(list => list.some(filterTopic))
              if (!matchesAny && search) return null

              return (
                <div key={subject} className="space-y-4 border-l-2 border-semantic-purple-bg pl-4 py-1">
                  <h2 className="text-section font-semibold text-text-primary mb-2">{subject}</h2>
                  <div className="space-y-3">
                    {Object.entries(categories).map(([category, list]) => {
                      const filteredList = list.filter(filterTopic)
                      if (filteredList.length === 0 && search) return null
                      return (
                        <div
                          key={category}
                          data-category={category}
                          data-subject={subject}
                          draggable={canDrag === category}
                          onDragStart={(e) => handleDragStart(e, category, subject)}
                          onDragOver={(e) => handleDragOver(e, category, subject)}
                          onDragEnd={handleDragEnd}
                          onTouchMove={(e) => handleTouchMove(e, subject)}
                          onTouchEnd={handleTouchEnd}
                          className={cn(
                            "transition-all duration-200",
                            draggedCategory === category && draggedSubject === subject && "opacity-45 scale-[0.98] border border-dashed border-accent-light rounded-card"
                          )}
                        >
                          <TopicChecklist
                            title={category}
                            topics={filteredList}
                            onUpdate={handleUpdate}
                            onAdd={(name) => handleAddCustom(subject, category, name)}
                            onDelete={deleteTopic}
                            onDeleteCategory={setDeleteConfirmSection}
                            onRenameCategory={renameCategory}
                            onDragHandleMouseDown={() => setCanDrag(category)}
                            onDragHandleMouseUp={() => setCanDrag(null)}
                            onDragHandleTouchStart={() => handleTouchStart(category, subject)}
                            onDragHandleTouchEnd={handleTouchEnd}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}

          {activeTab === 'aptitude' && (
            Object.entries(groupedData).map(([subject, categories]) => {
              const matchesAny = Object.values(categories).some(list => list.some(filterTopic))
              if (!matchesAny && search) return null

              return (
                <div key={subject} className="space-y-4 border-l-2 border-semantic-green-bg pl-4 py-1">
                  <h2 className="text-section font-semibold text-text-primary mb-2">
                    {SUBJECT_LABELS[subject] || subject}
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(categories).map(([category, list]) => {
                      const filteredList = list.filter(filterTopic)
                      if (filteredList.length === 0 && search) return null
                      return (
                        <div
                          key={category}
                          data-category={category}
                          data-subject={subject}
                          draggable={canDrag === category}
                          onDragStart={(e) => handleDragStart(e, category, subject)}
                          onDragOver={(e) => handleDragOver(e, category, subject)}
                          onDragEnd={handleDragEnd}
                          onTouchMove={(e) => handleTouchMove(e, subject)}
                          onTouchEnd={handleTouchEnd}
                          className={cn(
                            "transition-all duration-200",
                            draggedCategory === category && draggedSubject === subject && "opacity-45 scale-[0.98] border border-dashed border-accent-light rounded-card"
                          )}
                        >
                          <TopicChecklist
                            title={category}
                            topics={filteredList}
                            onUpdate={handleUpdate}
                            onAdd={(name) => handleAddCustom(subject, category, name)}
                            onDelete={deleteTopic}
                            onDeleteCategory={setDeleteConfirmSection}
                            onRenameCategory={renameCategory}
                            onDragHandleMouseDown={() => setCanDrag(category)}
                            onDragHandleMouseUp={() => setCanDrag(null)}
                            onDragHandleTouchStart={() => handleTouchStart(category, subject)}
                            onDragHandleTouchEnd={handleTouchEnd}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}

          {activeTab === 'custom' && (
            Object.entries(groupedData).map(([subject, categories]) => {
              const matchesAny = Object.values(categories).some(list => list.some(filterTopic))
              if (!matchesAny && search) return null

              return (
                <div key={subject} className="space-y-4 border-l-2 border-semantic-orange-bg pl-4 py-1">
                  {/* Editable custom subject header */}
                  {editingSubject === subject ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        ref={subjectEditRef}
                        value={editSubjectValue}
                        onChange={(e) => setEditSubjectValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubjectRenameConfirm()
                          if (e.key === 'Escape') setEditingSubject(null)
                        }}
                        className="text-section font-semibold bg-surface border border-accent/50 rounded-md px-2 py-0.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button onClick={handleSubjectRenameConfirm} className="p-1 rounded text-semantic-green hover:bg-semantic-green/10" title="Save"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingSubject(null)} className="p-1 rounded text-text-muted hover:bg-hover" title="Cancel"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2 group/subj">
                      <h2 className="text-section font-semibold text-text-primary">{subject}</h2>
                      <button
                        onClick={() => { setEditingSubject(subject); setEditSubjectValue(subject) }}
                        className="p-1 rounded text-text-muted opacity-0 group-hover/subj:opacity-100 hover:text-accent-light hover:bg-hover transition-all"
                        title="Rename subject"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {Object.entries(categories).map(([category, list]) => {
                      const filteredList = list.filter(filterTopic)
                      if (filteredList.length === 0 && search) return null
                      return (
                        <div
                          key={category}
                          data-category={category}
                          data-subject={subject}
                          draggable={canDrag === category}
                          onDragStart={(e) => handleDragStart(e, category, subject)}
                          onDragOver={(e) => handleDragOver(e, category, subject)}
                          onDragEnd={handleDragEnd}
                          onTouchMove={(e) => handleTouchMove(e, subject)}
                          onTouchEnd={handleTouchEnd}
                          className={cn(
                            "transition-all duration-200",
                            draggedCategory === category && draggedSubject === subject && "opacity-45 scale-[0.98] border border-dashed border-accent-light rounded-card"
                          )}
                        >
                          <TopicChecklist
                            title={category}
                            topics={filteredList}
                            onUpdate={handleUpdate}
                            onAdd={(name) => handleAddCustom(subject, category, name)}
                            onDelete={deleteTopic}
                            onDeleteCategory={setDeleteConfirmSection}
                            onRenameCategory={renameCategory}
                            onDragHandleMouseDown={() => setCanDrag(category)}
                            onDragHandleMouseUp={() => setCanDrag(null)}
                            onDragHandleTouchStart={() => handleTouchStart(category, subject)}
                            onDragHandleTouchEnd={handleTouchEnd}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}

          {/* Empty Search State */}
          {topics.length > 0 && search && !Object.values(groupedData).some((catOrSub) => {
            if (activeTab === 'dsa') {
              return catOrSub.some(filterTopic)
            }
            return Object.values(catOrSub).some((list) => list.some(filterTopic))
          }) && (
              <div className="text-center py-12 bg-card rounded-card border border-border-subtle">
                <p className="text-secondary text-text-secondary">No topics match your search criteria.</p>
              </div>
            )}
        </div>
      )}
      {/* Delete Section Dialog */}
      <Dialog open={!!deleteConfirmSection} onOpenChange={() => setDeleteConfirmSection(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Section</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete the section &quot;{deleteConfirmSection}&quot;? This will delete all topics inside this category. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmSection(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmSection) {
                  await deleteCategory(deleteConfirmSection)
                }
                setDeleteConfirmSection(null)
              }}
            >
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tab Dialog */}
      <Dialog open={!!deleteTabConfirm} onOpenChange={() => setDeleteTabConfirm(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Tab</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete the &quot;{deleteTabConfirm ? getTabLabel(deleteTabConfirm) : ''}&quot; tab?
              This will permanently delete <strong>{deleteTabConfirm ? tabTopicCount(deleteTabConfirm) : 0} topic(s)</strong> and hide the tab.
              You can restore it later from the ↻ button.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTabConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTabConfirm && handleTabDelete(deleteTabConfirm)}
            >
              Delete Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

