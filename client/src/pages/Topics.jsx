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
import { SUBJECT_LABELS } from '@/utils/topicSeeds'

export default function Topics() {
  const { user } = useAuth()
  const { topics, loading, updateTopic, addTopic, deleteTopic } = useTopics(user?.uid)
  
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [sectionSubject, setSectionSubject] = useState('OS')

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
      // Ensure groups are in structured order or just return them
      return groups
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
        }
      })
      return groups
    }

    return {}
  }, [topics, activeTab, loading])

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
                <TopicChecklist
                  key={category}
                  title={category}
                  topics={filteredList}
                  onUpdate={handleUpdate}
                  onAdd={(name) => handleAddCustom('DSA', category, name)}
                  onDelete={deleteTopic}
                  onDeleteCategory={deleteCategory}
                />
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
                        <TopicChecklist
                          key={category}
                          title={category}
                          topics={filteredList}
                          onUpdate={handleUpdate}
                          onAdd={(name) => handleAddCustom(subject, category, name)}
                          onDelete={deleteTopic}
                          onDeleteCategory={deleteCategory}
                        />
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
                        <TopicChecklist
                          key={category}
                          title={category}
                          topics={filteredList}
                          onUpdate={handleUpdate}
                          onAdd={(name) => handleAddCustom(subject, category, name)}
                          onDelete={deleteTopic}
                          onDeleteCategory={deleteCategory}
                        />
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
    </div>
  )
}
