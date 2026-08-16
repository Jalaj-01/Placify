import { useState, useEffect } from 'react'
import {
  Bookmark, Search, Plus, Trash2, Edit2, ExternalLink, Loader2, Tag,
  AlertCircle, Globe, CheckSquare, FileText, Youtube, Code2, Sparkles,
  Link as LinkIcon, Share2, School, GraduationCap, BookOpen, Layers, Check
} from 'lucide-react'
import ShareDialog from '@/components/share/ShareDialog'

import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const FACULTY_CATEGORIES = [
  { id: 'Curriculum & Syllabi', label: 'Curriculum & Syllabi', icon: BookOpen, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'Coding Practice & Tests', label: 'Coding Practice & Tests', icon: Code2, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Research Papers & Journals', label: 'Research Papers & Journals', icon: FileText, colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'Teaching Tools & Labs', label: 'Teaching Tools & Labs', icon: Sparkles, colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'University & Exam Portals', label: 'University & Exam Portals', icon: Globe, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Lectures & Seminars', label: 'Lectures & Seminars', icon: Youtube, colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'Other Academic Links', label: 'Other Academic Links', icon: Bookmark, colorClass: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
]

const STUDENT_CATEGORIES = [
  { id: 'QA/Testing', label: 'QA/Testing', icon: CheckSquare, colorClass: 'text-semantic-green bg-semantic-green-bg border-semantic-green/20' },
  { id: 'Coding Practice', label: 'Coding Practice', icon: Code2, colorClass: 'text-accent-light bg-accent/10 border-accent/20' },
  { id: 'Official Docs', label: 'Official Docs', icon: FileText, colorClass: 'text-semantic-yellow bg-semantic-yellow-bg border-semantic-yellow/20' },
  { id: 'Tutorials', label: 'Tutorials', icon: Youtube, colorClass: 'text-semantic-blue bg-semantic-blue-bg border-semantic-blue/20' },
  { id: 'Portfolio/Websites', label: 'Portfolio/Websites', icon: Globe, colorClass: 'text-semantic-purple bg-semantic-purple-bg border-semantic-purple-bg/20' },
  { id: 'Other', label: 'Other', icon: Bookmark, colorClass: 'text-text-secondary bg-elevated border-border-subtle' }
]

const PHD_CATEGORIES = [
  { id: 'Research Papers & Preprints', label: 'Research Papers & Preprints', icon: FileText, colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'Conference & Journals', label: 'Conference & Journals', icon: Globe, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'Datasets & Benchmarks', label: 'Datasets & Benchmarks', icon: CheckSquare, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Simulations & Code Repos', label: 'Simulations & Code Repos', icon: Code2, colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'Grants & Fellowships', label: 'Grants & Fellowships', icon: Sparkles, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Other', label: 'Other', icon: Bookmark, colorClass: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
]

const FACULTY_PRESETS = [
  {
    title: 'IEEE Xplore Digital Library',
    url: 'https://ieeexplore.ieee.org',
    category: 'Research Papers & Journals',
    description: 'Peer-reviewed journals, transactions, and conference proceedings in engineering & CS.',
    tags: ['ieee', 'research', 'journals']
  },
  {
    title: 'Google Scholar',
    url: 'https://scholar.google.com',
    category: 'Research Papers & Journals',
    description: 'Academic paper citation tracking, h-index lookups, and literature reviews.',
    tags: ['citations', 'papers', 'literature']
  },
  {
    title: 'CS50 Harvard OpenCourseWare',
    url: 'https://cs50.harvard.edu/x/',
    category: 'Curriculum & Syllabi',
    description: 'Harvard University computer science curriculum, slides, and problem set design.',
    tags: ['harvard', 'curriculum', 'pedagogy']
  },
  {
    title: 'MIT OpenCourseWare (EECS)',
    url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
    category: 'Curriculum & Syllabi',
    description: 'Complete MIT EECS lecture notes, syllabi, assignments, and exam archives.',
    tags: ['mit', 'syllabus', 'eecs']
  },
  {
    title: 'GeeksforGeeks Academic Practice Bank',
    url: 'https://www.geeksforgeeks.org/',
    category: 'Coding Practice & Tests',
    description: 'Subject-wise quizzes, programming questions, and GATE/curriculum question pools.',
    tags: ['gfg', 'coding', 'quizzes']
  },
  {
    title: 'ACM Digital Library',
    url: 'https://dl.acm.org/',
    category: 'Research Papers & Journals',
    description: 'Association for Computing Machinery flagship publications and computing conference proceedings.',
    tags: ['acm', 'computing', 'conferences']
  },
]

export default function Bookmarks() {
  const { user, profile } = useAuth()
  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark } = useBookmarks(user?.uid)

  const [activeRoleOverride, setActiveRoleOverride] = useState(() => localStorage.getItem('placify_active_role'))

  useEffect(() => {
    const handleStorage = () => setActiveRoleOverride(localStorage.getItem('placify_active_role'))
    window.addEventListener('storage', handleStorage)
    window.addEventListener('placify-role-change', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('placify-role-change', handleStorage)
    }
  }, [])

  const roleRaw = (activeRoleOverride || profile?.role || 'student').toLowerCase()
  const isTeacher = roleRaw === 'teacher' || roleRaw === 'faculty'
  const isPhd = roleRaw === 'phd' || roleRaw === 'research'
  const isStudent = !isTeacher && !isPhd

  const currentCategories = isTeacher ? FACULTY_CATEGORIES : (isPhd ? PHD_CATEGORIES : STUDENT_CATEGORIES)
  const defaultCategory = currentCategories[0].id

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [shareItemData, setShareItemData] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formCategory, setFormCategory] = useState(defaultCategory)
  const [formDescription, setFormDescription] = useState('')
  const [formTags, setFormTags] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Open add bookmark modal and reset form
  const handleOpenAdd = (preset = null) => {
    if (preset) {
      setFormTitle(preset.title)
      setFormUrl(preset.url)
      setFormCategory(preset.category)
      setFormDescription(preset.description || '')
      setFormTags(preset.tags ? preset.tags.join(', ') : '')
    } else {
      setFormTitle('')
      setFormUrl('')
      setFormCategory(defaultCategory)
      setFormDescription('')
      setFormTags('')
    }
    setError('')
    setIsAddOpen(true)
  }

  // Open edit bookmark modal and set form
  const handleOpenEdit = (b) => {
    setEditingBookmark(b)
    setFormTitle(b.title)
    setFormUrl(b.url)
    setFormCategory(b.category || defaultCategory)
    setFormDescription(b.description || '')
    setFormTags(b.tags ? b.tags.join(', ') : '')
    setError('')
  }

  const cleanUrl = (url) => {
    let targetUrl = url.trim()
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl
    }
    return targetUrl
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim() || !formUrl.trim()) {
      setError('Title and URL are required.')
      return
    }

    setSubmitting(true)
    setError('')

    const finalUrl = cleanUrl(formUrl)
    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    try {
      await addBookmark(
        formTitle.trim(),
        finalUrl,
        formCategory,
        formDescription.trim(),
        tagsArray
      )
      setIsAddOpen(false)
    } catch (err) {
      setError('Failed to add bookmark: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim() || !formUrl.trim()) {
      setError('Title and URL are required.')
      return
    }

    setSubmitting(true)
    setError('')

    const finalUrl = cleanUrl(formUrl)
    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    try {
      await updateBookmark(editingBookmark.id, {
        title: formTitle.trim(),
        url: finalUrl,
        category: formCategory,
        description: formDescription.trim(),
        tags: tagsArray
      })
      setEditingBookmark(null)
    } catch (err) {
      setError('Failed to update bookmark: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter Bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesCategory = activeCategory === 'All' || b.category === activeCategory
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      b.title.toLowerCase().includes(searchLower) ||
      b.url.toLowerCase().includes(searchLower) ||
      (b.description && b.description.toLowerCase().includes(searchLower)) ||
      (b.tags && b.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    return matchesCategory && matchesSearch
  })

  // Get count per category
  const getCategoryCount = (catId) => {
    if (catId === 'All') return bookmarks.length
    return bookmarks.filter((b) => b.category === catId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/50 pb-5">
        <div className="flex items-center gap-3.5">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner',
            isTeacher ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : (isPhd ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-accent/15 border-accent/20 text-accent')
          )}>
            {isTeacher ? <School className="h-6 w-6" /> : (isPhd ? <BookOpen className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                {isTeacher ? 'Faculty Academic Bookmarks' : (isPhd ? 'Research & Scholar Bookmarks' : 'Bookmarks & Resources')}
              </h1>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                isTeacher ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : (isPhd ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-accent/15 text-accent border-accent/30')
              )}>
                {isTeacher ? 'Faculty' : (isPhd ? 'PhD' : 'Student')}
              </span>
            </div>
            <p className="text-text-secondary text-xs mt-0.5">
              {isTeacher
                ? 'Curate external syllabi, research papers, exam portals, contest problem sets, and pedagogical resources.'
                : (isPhd
                  ? 'Collect scientific preprints, citation databases, simulation repos, datasets, and grant portals.'
                  : 'Collect external QA sheets, practice portals, official docs, and DSA cheat sheets.')}
            </p>
          </div>
        </div>

        <Button
          onClick={() => handleOpenAdd()}
          className={cn(
            'flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all',
            isTeacher
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-purple-500/20'
              : 'bg-accent text-white hover:opacity-95 shadow-accent/20'
          )}
        >
          <Plus className="h-4 w-4" /> Add Academic Bookmark
        </Button>
      </div>

      {/* Faculty Curated Quick-Seeds Bar */}
      {isTeacher && (
        <div className="p-4 rounded-2xl bg-surface/80 border border-purple-500/20 backdrop-blur-xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Recommended Faculty Curations (1-Click Bookmark):</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {FACULTY_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenAdd(p)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-text-primary hover:text-purple-200 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm group"
              >
                <Plus className="h-3 w-3 text-purple-400 group-hover:rotate-90 transition-transform" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder={isTeacher ? "Search academic links, papers, tags..." : "Search bookmarks, tags, URLs..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface/60 border-border-subtle text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
              activeCategory === 'All'
                ? (isTeacher ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-accent text-white shadow-md shadow-accent/20')
                : 'bg-surface/80 border border-border-subtle text-text-secondary hover:text-text-primary'
            )}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {getCategoryCount('All')}
            </span>
          </button>
          {currentCategories.map((cat) => {
            const Icon = cat.icon
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
                  isSelected
                    ? (isTeacher ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-accent text-white shadow-md shadow-accent/20')
                    : 'bg-surface/80 border border-border-subtle text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bookmarks Grid / Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-xs">Loading bookmarks...</p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border-subtle bg-surface/40 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-text-muted shadow-sm">
            <Bookmark className="h-7 w-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-sm font-bold text-text-primary">
              {searchQuery || activeCategory !== 'All' ? 'No matching bookmarks found' : 'No Bookmarks Yet'}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {searchQuery || activeCategory !== 'All'
                ? 'Try adjusting your search query or switching to another category.'
                : (isTeacher
                  ? 'Start organizing your teaching links, research repositories, test portals, and reference syllabi.'
                  : 'Start saving helpful links, practice questions, and cheat sheets for placement preparation.')}
            </p>
          </div>
          <Button onClick={() => handleOpenAdd()} size="sm" className="text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add First Bookmark
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((b) => {
            const catObj = currentCategories.find((c) => c.id === b.category) || {
              label: b.category || 'Other',
              icon: Bookmark,
              colorClass: 'text-text-secondary bg-elevated border-border-subtle'
            }
            const Icon = catObj.icon

            return (
              <Card
                key={b.id}
                className="group border border-border-subtle/80 bg-surface/70 hover:bg-surface hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-4 space-y-3.5">
                  <div className="space-y-2">
                    {/* Top Row: Category Badge & Action Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5', catObj.colorClass)}>
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{catObj.label}</span>
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyLink(b.url, b.id)}
                          className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === b.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <LinkIcon className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setShareItemData({ type: 'bookmark', data: b })}
                          className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-accent transition-colors"
                          title="Share Bookmark"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                          title="Edit Bookmark"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(b.id)}
                          className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-red-400 transition-colors"
                          title="Delete Bookmark"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-accent transition-colors" title={b.title}>
                      {b.title}
                    </h3>

                    {/* URL */}
                    <div className="flex items-center gap-1 text-[11px] text-text-muted hover:text-accent cursor-pointer select-none">
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate underline font-mono"
                        title={b.url}
                      >
                        {b.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>

                    {/* Description */}
                    {b.description && (
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
                        {b.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer tags and launch */}
                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border-subtle/50">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 items-center min-w-0 flex-1">
                      {b.tags && b.tags.length > 0 ? (
                        b.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface border border-border-subtle text-text-secondary truncate max-w-[90px]"
                            title={t}
                          >
                            <Tag className="h-2 w-2 shrink-0 text-text-muted" />
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-text-muted italic">No tags</span>
                      )}
                    </div>

                    {/* Direct Launch Link Button */}
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-border-subtle text-text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/10 transition-all shrink-0 shadow-sm"
                      title="Open website in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editingBookmark}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false)
            setEditingBookmark(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">
              {editingBookmark ? 'Edit Academic Bookmark' : 'Add New Academic Bookmark'}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              {isTeacher
                ? 'Save any syllabus doc, research repository, question bank or external educational platform.'
                : 'Save any external website, repository, notes doc or QA checklist.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingBookmark ? handleEditSubmit : handleAddSubmit} className="space-y-4 pt-3">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Title</label>
              <Input
                placeholder={isTeacher ? "e.g. IEEE Xplore Neural Systems Journal" : "e.g. GeeksforGeeks QA Mock Sheets"}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">URL</label>
              <Input
                placeholder="e.g. ieeexplore.ieee.org or https://cs50.harvard.edu"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Category</label>
              <Select
                value={formCategory}
                onValueChange={setFormCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Description (Optional)</label>
              <textarea
                placeholder="Add brief details about what is in this resource..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full min-h-[70px] bg-base text-text-primary text-xs font-sans p-3 outline-none resize-y rounded-lg border border-border-subtle focus:border-accent/40 transition-all"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Tags (Optional, comma-separated)</label>
              <Input
                placeholder="e.g. curriculum, algorithms, question-bank"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium bg-semantic-red-bg p-2.5 rounded-lg border border-semantic-red/10">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false)
                  setEditingBookmark(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingBookmark ? (
                  'Save Changes'
                ) : (
                  'Add Bookmark'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[420px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Bookmark</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete this bookmark? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmId) {
                  try {
                    await deleteBookmark(deleteConfirmId)
                  } catch (err) {
                    console.error('Delete failed:', err)
                  }
                }
                setDeleteConfirmId(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {shareItemData && (
        <ShareDialog
          open={!!shareItemData}
          onOpenChange={(val) => !val && setShareItemData(null)}
          itemType={shareItemData.type}
          itemData={shareItemData.data}
          senderUid={user?.uid}
          senderEmail={user?.email}
        />
      )}
    </div>
  )
}
