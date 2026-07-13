import { useState, useMemo, useEffect } from 'react'
import { BookOpen, Plus } from 'lucide-react'
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
  const { topics, loading, updateTopic, addTopic, deleteTopic, deleteCategory, profile, updateCategoryOrder } = useTopics(user?.uid)

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

  const [activeTab, setActiveTab] = useState('dsa')

  // Auto reset subject selection when tab changes
  useEffect(() => {
    if (activeTab === 'cs-theory') {
      setSectionSubject('OS')
    } else if (activeTab === 'aptitude') {
      setSectionSubject('Aptitude-Quant')
    } else {
      setSectionSubject('DSA')
    }
  }, [activeTab])

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

    return {}
  }, [topics, activeTab, loading, localOrders])

  // Overall calculations for progress meters
  const progressStats = useMemo(() => {
    if (loading || !topics.length) return { dsa: 0, cs: 0, apt: 0 }

    const dsa = topics.filter((t) => t.subject === 'DSA')
    const cs = topics.filter((t) => ['OS', 'DBMS', 'CN', 'OOPS'].includes(t.subject))
    const apt = topics.filter((t) => t.subject.startsWith('Aptitude-'))

    const getPct = (list) => {
      if (!list.length) return 0
      const done = list.filter((t) => t.status === 'Done').length
      return Math.round((done / list.length) * 100)
    }

    return {
      dsa: getPct(dsa),
      cs: getPct(cs),
      apt: getPct(apt),
    }
  }, [topics, loading])

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
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto md:min-w-[400px] bg-card p-3 rounded-card border border-border-subtle">
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
        </div>
      </div>

      {/* Tabs list */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-surface p-1 border border-border-subtle">
          <TabsTrigger value="dsa">DSA</TabsTrigger>
          <TabsTrigger value="cs-theory">CS Theory</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
        </TabsList>
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
        {!showAddSection ? (
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1.5 text-xs py-1.5 h-auto bg-elevated border border-border text-text-primary hover:bg-hover"
              variant="outline"
            >
              <Plus className="h-4 w-4 text-accent-light" /> Add Section
            </Button>
          </div>
        ) : (
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
    </div>
  )
}

