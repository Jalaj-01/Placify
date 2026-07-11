import { useState } from 'react'
import {
  Bookmark, Search, Plus, Trash2, Edit2, ExternalLink, Loader2, Tag,
  AlertCircle, Globe, CheckSquare, FileText, Youtube, Code2, Sparkles,
  Link as LinkIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'QA/Testing', label: 'QA/Testing', icon: CheckSquare, colorClass: 'text-semantic-green bg-semantic-green-bg border-semantic-green/20' },
  { id: 'Coding Practice', label: 'Coding Practice', icon: Code2, colorClass: 'text-accent-light bg-accent/10 border-accent/20' },
  { id: 'Official Docs', label: 'Official Docs', icon: FileText, colorClass: 'text-semantic-yellow bg-semantic-yellow-bg border-semantic-yellow/20' },
  { id: 'Tutorials', label: 'Tutorials', icon: Youtube, colorClass: 'text-semantic-blue bg-semantic-blue-bg border-semantic-blue/20' },
  { id: 'Portfolio/Websites', label: 'Portfolio/Websites', icon: Globe, colorClass: 'text-semantic-purple bg-semantic-purple-bg border-semantic-purple-bg/20' },
  { id: 'Other', label: 'Other', icon: Bookmark, colorClass: 'text-text-secondary bg-elevated border-border-subtle' }
]

export default function Bookmarks() {
  const { user } = useAuth()
  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark } = useBookmarks(user?.uid)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formCategory, setFormCategory] = useState('QA/Testing')
  const [formDescription, setFormDescription] = useState('')
  const [formTags, setFormTags] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Open add bookmark modal and reset form
  const handleOpenAdd = () => {
    setFormTitle('')
    setFormUrl('')
    setFormCategory('QA/Testing')
    setFormDescription('')
    setFormTags('')
    setError('')
    setIsAddOpen(true)
  }

  // Open edit bookmark modal and set form
  const handleOpenEdit = (b) => {
    setEditingBookmark(b)
    setFormTitle(b.title)
    setFormUrl(b.url)
    setFormCategory(b.category)
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/20 shadow-inner">
            <Bookmark className="h-6 w-6 text-accent-light" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary tracking-tight">Bookmarks & Resources</h1>
            <p className="text-secondary text-text-secondary text-xs mt-0.5">Collect external QA sheets, practice portals, docs, and cheat sheets</p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2 text-xs font-semibold px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Add Bookmark
        </Button>
      </div>

      {/* Control Panel: Search & Categories */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search bookmarks by title, tags or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-surface border-border-subtle"
          />
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveCategory('All')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 shrink-0",
              activeCategory === 'All'
                ? "bg-accent/15 border-accent text-accent-light"
                : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover"
            )}
          >
            <span>All Bookmarks</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              activeCategory === 'All' ? "bg-accent/20 text-accent-light" : "bg-elevated text-text-muted"
            )}>
              {getCategoryCount('All')}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 shrink-0",
                  isSelected
                    ? "bg-accent/15 border-accent text-accent-light"
                    : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover"
                )}
              >
                <CatIcon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  isSelected ? "bg-accent/20 text-accent-light" : "bg-elevated text-text-muted"
                )}>
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bookmarks Grid list */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border-subtle max-w-xl mx-auto space-y-4">
          <Globe className="h-16 w-16 text-text-muted/65 mx-auto stroke-[1.25]" />
          <div className="space-y-1.5">
            <h3 className="text-body font-bold text-text-primary">No bookmarks found</h3>
            <p className="text-secondary text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              {searchQuery || activeCategory !== 'All'
                ? "Try clearing your filters or search query to find other bookmarks."
                : "Organize external resources, QA sheets, portfolio links, or any useful tools to review them anytime."}
            </p>
          </div>
          {(!searchQuery && activeCategory === 'All') && (
            <Button onClick={handleOpenAdd} size="sm" className="px-5">
              Add Your First Link
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((b) => {
            const catInfo = CATEGORIES.find((c) => c.id === b.category) || CATEGORIES[5]
            const CatIcon = catInfo.icon

            return (
              <Card
                key={b.id}
                className="group bg-card border border-border-subtle hover:border-border-hover transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-card-hover hover:scale-[1.01]"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                  {/* Card Header Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {/* Category Badge */}
                      <span className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0",
                        catInfo.colorClass
                      )}>
                        <CatIcon className="h-3 w-3" />
                        {b.category}
                      </span>

                      {/* Utility Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 rounded hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
                          title="Edit Bookmark"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(b.id)}
                          className="p-1 rounded hover:bg-hover text-text-secondary hover:text-semantic-red transition-colors"
                          title="Delete Bookmark"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-accent-light transition-colors" title={b.title}>
                      {b.title}
                    </h3>

                    {/* URL */}
                    <div className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent-light cursor-pointer select-none">
                      <LinkIcon className="h-3 w-3 shrink-0" />
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
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 mt-1">
                        {b.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer tags and launch */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-subtle/50">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 items-center min-w-0 flex-1">
                      {b.tags && b.tags.length > 0 ? (
                        b.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary truncate max-w-[80px]"
                            title={t}
                          >
                            <Tag className="h-2 w-2 shrink-0 text-text-muted" />
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-text-muted italic">No tags</span>
                      )}
                    </div>

                    {/* Direct Launch Link Button */}
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border-subtle text-text-muted hover:text-accent-light hover:border-accent/40 hover:bg-accent/5 transition-all shrink-0 shadow-sm"
                      title="Open website"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
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
              {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Save any external website, repository, notes doc or QA checklist.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingBookmark ? handleEditSubmit : handleAddSubmit} className="space-y-4 pt-3">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Title</label>
              <Input
                placeholder="e.g. GeeksforGeeks QA Mock Sheets"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">URL</label>
              <Input
                placeholder="e.g. hackerrank.com or https://leetcode.com"
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
                  {CATEGORIES.map((cat) => (
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
                placeholder="e.g. dsa, cheat sheet, dynamic programming"
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
    </div>
  )
}
