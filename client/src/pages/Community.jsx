import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Users, Search, Plus, Heart, Share2, Download, ExternalLink,
  Youtube, BookOpen, FileText, Code2, Terminal, Check, Copy,
  Trash2, Sparkles, Filter, ArrowRight, BookMarked, Eye, MessageSquare,
  Layers, CheckCircle2, X, ChevronRight, Play, Laptop, FileCheck
} from 'lucide-react'
import {
  subscribeCommunityPosts,
  createCommunityPost,
  toggleCommunityPostLike,
  deleteCommunityPost,
  addCourseDoc,
  addLibraryDoc,
  savePlaygroundFile,
  saveNotebook,
} from '@/services/firestoreService'
import { useNotebooks } from '@/hooks/useNotebooks'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Users },
  { id: 'course', label: 'Course Vault', icon: Youtube, color: 'text-rose-500' },
  { id: 'notebook', label: 'Notes & Notebooks', icon: BookOpen, color: 'text-indigo-500' },
  { id: 'resource', label: 'Resource Library', icon: FileText, color: 'text-amber-500' },
  { id: 'code', label: 'Code Playground', icon: Code2, color: 'text-sky-500' },
]

export default function Community() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { notebooks } = useNotebooks(user)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'popular'

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareCategory, setShareCategory] = useState('course')
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')
  const [postTags, setPostTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const [copiedPostId, setCopiedPostId] = useState(null)

  // Category-specific fields for share modal
  // Course:
  const [courseUrl, setCourseUrl] = useState('')
  const [courseIsPlaylist, setCourseIsPlaylist] = useState(false)
  // Notebook:
  const [selectedNotebookId, setSelectedNotebookId] = useState('')
  const [notebookCollabCode, setNotebookCollabCode] = useState('')
  // Resource:
  const [resourceDocUrl, setResourceDocUrl] = useState('')
  const [resourceDocType, setResourceDocType] = useState('pdf')
  const [resourceDocSize, setResourceDocSize] = useState('1.5 MB')
  // Code:
  const [codeFileName, setCodeFileName] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [codeContent, setCodeContent] = useState('')

  // Subscribe to community feed
  useEffect(() => {
    const unsub = subscribeCommunityPosts((data) => {
      setPosts(data || [])
      setLoading(false)
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  // Auto-fill notebook data if user selects an existing notebook
  useEffect(() => {
    if (shareCategory === 'notebook' && selectedNotebookId) {
      const nb = notebooks.find((n) => n.id === selectedNotebookId)
      if (nb) {
        if (!postTitle) setPostTitle(nb.title || '')
        if (!postDescription) setPostDescription(`Collaborative notebook on ${nb.subject || 'DSA'} with ${nb.pages?.length || 1} pages.`)
        if (nb.collabRoomId) setNotebookCollabCode(nb.collabRoomId)
      }
    }
  }, [selectedNotebookId, shareCategory, notebooks, postTitle, postDescription])

  // Filter & Sort Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q)
        const descMatch = p.description?.toLowerCase().includes(q)
        const authorMatch = p.authorName?.toLowerCase().includes(q)
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q))
        return titleMatch || descMatch || authorMatch || tagMatch
      })
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }

    return result
  }, [posts, selectedCategory, searchQuery, sortBy])

  // Like / Upvote Post
  const handleLike = async (postId) => {
    if (!user?.uid) return
    await toggleCommunityPostLike(user.uid, postId)
  }

  // Copy shareable link
  const handleCopyLink = (post) => {
    const link = `${window.location.origin}/community#${post.id}`
    navigator.clipboard.writeText(link)
    setCopiedPostId(post.id)
    setTimeout(() => setCopiedPostId(null), 2500)
  }

  // Delete post (author or admin)
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to remove this post from the community?')) return
    await deleteCommunityPost(postId)
  }

  // 1-Click Import to user's workspace
  const handleImportToWorkspace = async (post) => {
    if (!user?.uid) {
      alert('Please log in to save items to your workspace.')
      return
    }

    setImportStatus({ id: post.id, message: 'Importing...' })

    try {
      const { category, itemData } = post

      if (category === 'course') {
        const name = itemData?.name || post.title
        const url = itemData?.url || ''
        const embedId = itemData?.embedId || ''
        const isPlaylist = !!itemData?.isPlaylist
        await addCourseDoc(user.uid, name, url, embedId, isPlaylist)
        setImportStatus({ id: post.id, success: true, message: 'Added to your Course Vault!' })
      } else if (category === 'notebook') {
        const newNb = {
          id: `nb-imported-${Date.now()}`,
          title: itemData?.title || post.title,
          subject: itemData?.subject || 'Community Notes',
          paperStyle: itemData?.paperStyle || 'ruled',
          colorTheme: itemData?.colorTheme || 'indigo',
          isCollaborative: true,
          collabRoomId: itemData?.collabRoomId || `collab-${Math.random().toString(36).substring(2, 8)}`,
          pages: itemData?.pages || [
            {
              id: 'p-1',
              title: post.title,
              htmlContent: `<h1>${post.title}</h1><p>${post.description || ''}</p>`,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await saveNotebook(user.uid, newNb)
        setImportStatus({ id: post.id, success: true, message: 'Imported to your Notebooks!' })
      } else if (category === 'resource') {
        const name = itemData?.name || post.title
        const url = itemData?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        const type = itemData?.type || 'pdf'
        const size = itemData?.size || '1.5 MB'
        await addLibraryDoc(user.uid, name, url, type, size)
        setImportStatus({ id: post.id, success: true, message: 'Saved to your Resource Library!' })
      } else if (category === 'code') {
        const name = itemData?.name || 'community-snippet.js'
        const code = itemData?.code || '// Code snippet from community\n'
        await savePlaygroundFile(user.uid, null, name, code)
        setImportStatus({ id: post.id, success: true, message: 'Saved to Code Playground!' })
      }

      setTimeout(() => {
        setImportStatus(null)
      }, 3500)
    } catch (err) {
      console.error('Import failed', err)
      setImportStatus({ id: post.id, success: false, message: `Failed: ${err.message}` })
      setTimeout(() => setImportStatus(null), 3500)
    }
  }

  // Handle Share Post Submission
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!postTitle.trim()) {
      alert('Please enter a title for your post.')
      return
    }

    setIsSubmitting(true)
    try {
      let itemData = {}

      if (shareCategory === 'course') {
        let embedId = ''
        const url = courseUrl.trim()
        if (url.includes('v=')) {
          embedId = url.split('v=')[1]?.split('&')[0] || ''
        } else if (url.includes('youtu.be/')) {
          embedId = url.split('youtu.be/')[1]?.split('?')[0] || ''
        }
        itemData = {
          name: postTitle.trim(),
          url,
          embedId: embedId || '0bHoB35fCmg',
          isPlaylist: courseIsPlaylist,
        }
      } else if (shareCategory === 'notebook') {
        const existingNb = notebooks.find((n) => n.id === selectedNotebookId)
        itemData = {
          id: existingNb?.id || `nb-comm-${Date.now()}`,
          title: postTitle.trim(),
          subject: existingNb?.subject || 'DSA',
          collabRoomId: notebookCollabCode.trim() || existingNb?.collabRoomId || `collab-${Math.random().toString(36).substring(2, 8)}`,
          pages: existingNb?.pages || [
            {
              id: 'p-1',
              title: postTitle.trim(),
              htmlContent: `<h1>${postTitle.trim()}</h1><p>${postDescription.trim() || 'Shared study notes'}</p>`,
            },
          ],
        }
      } else if (shareCategory === 'resource') {
        itemData = {
          name: postTitle.trim(),
          url: resourceDocUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: resourceDocType,
          size: resourceDocSize.trim() || '1.2 MB',
        }
      } else if (shareCategory === 'code') {
        itemData = {
          name: codeFileName.trim() || `${postTitle.trim().toLowerCase().replace(/\s+/g, '-')}.js`,
          language: codeLanguage,
          code: codeContent.trim() || '// Algorithm & solution code\nconsole.log("Hello Community!");\n',
        }
      }

      await createCommunityPost(user, {
        title: postTitle.trim(),
        description: postDescription.trim(),
        category: shareCategory,
        tags: postTags,
        itemData,
      })

      // Reset form & close modal
      setPostTitle('')
      setPostDescription('')
      setPostTags('')
      setCourseUrl('')
      setSelectedNotebookId('')
      setNotebookCollabCode('')
      setResourceDocUrl('')
      setCodeFileName('')
      setCodeContent('')
      setIsShareModalOpen(false)
    } catch (err) {
      console.error('Failed to create post:', err)
      alert('Failed to publish post: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-base text-text-primary pb-20">
      {/* Top Banner / Hero Section */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-surface/80 via-surface/40 to-transparent py-10 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Campus Resource Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">
              Campus Community Hub
            </h1>
            <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
              Discover and share top lecture videos from Course Vault, collaborative study notebooks,
              interview preparation cheat sheets, and tested code playground algorithms with campus peers.
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-accent hover:bg-accent-light text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-accent/25 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Share to Community</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {/* Controls: Search, Category Tabs & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border-subtle overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.id
              const count =
                cat.id === 'all'
                  ? posts.length
                  : posts.filter((p) => p.category === cat.id).length

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                    isSelected
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'text-text-muted hover:text-text-primary hover:bg-hover'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', !isSelected && cat.color)} />
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                      isSelected ? 'bg-white/20 text-white' : 'bg-base text-text-muted'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search resources, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Upvoted</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-text-muted font-medium">Loading community items...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-surface/40 border border-border-subtle p-8">
            <Users className="h-12 w-12 text-text-muted mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">No items found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {searchQuery
                  ? `No community items match "${searchQuery}". Try a different keyword.`
                  : 'Be the first to share a video, notebook, or code snippet with the campus!'}
              </p>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold shadow-md shadow-accent/20"
            >
              + Share First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => {
              const hasLiked = user?.uid && post.likes?.includes(user.uid)
              const likeCount = post.likes?.length || 0
              const isOwner = user?.uid && (post.authorUid === user.uid || profile?.role === 'admin')
              const isImportingThis = importStatus?.id === post.id

              return (
                <div
                  key={post.id}
                  id={post.id}
                  className="bg-card border border-border-subtle hover:border-accent/40 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg space-y-5 group"
                >
                  {/* Card Top: Author, Category Badge & Options */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            post.authorPhoto ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.authorName || 'Peer')}`
                          }
                          alt={post.authorName}
                          className="h-10 w-10 rounded-2xl object-cover bg-base border border-border-subtle"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-text-primary">
                              {post.authorName || 'Anonymous Member'}
                            </span>
                            {post.authorRole && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">
                                {post.authorRole}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                          </span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider',
                          post.category === 'course'
                            ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                            : post.category === 'notebook'
                            ? 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
                            : post.category === 'resource'
                            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                            : 'text-sky-500 bg-sky-500/10 border-sky-500/20'
                        )}
                      >
                        {post.category === 'course' && <Youtube className="h-3 w-3" />}
                        {post.category === 'notebook' && <BookOpen className="h-3 w-3" />}
                        {post.category === 'resource' && <FileText className="h-3 w-3" />}
                        {post.category === 'code' && <Code2 className="h-3 w-3" />}
                        <span>{post.category}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-black text-base text-text-primary group-hover:text-accent transition-colors leading-snug">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-xs text-text-muted leading-relaxed mt-1.5 line-clamp-3">
                          {post.description}
                        </p>
                      )}
                    </div>

                    {/* Specific Item Interactive Previews */}
                    {post.category === 'course' && (
                      <div className="rounded-2xl overflow-hidden bg-base border border-border-subtle p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                            <Play className="h-5 w-5 fill-rose-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-text-primary truncate">
                              {post.itemData?.name || 'Lecture Video'}
                            </p>
                            <p className="text-[11px] text-text-muted truncate">
                              {post.itemData?.url || 'YouTube Lecture'}
                            </p>
                          </div>
                        </div>
                        {post.itemData?.url && (
                          <a
                            href={post.itemData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-surface hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                          >
                            <span>Watch</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {post.category === 'notebook' && (
                      <div className="rounded-2xl bg-base border border-border-subtle p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-text-primary truncate">
                              {post.itemData?.title || 'Interactive Collab Notebook'}
                            </p>
                            <span className="text-[10px] font-mono text-accent">
                              #{post.itemData?.collabRoomId || 'collab-room'}
                            </span>
                          </div>
                        </div>
                        {post.itemData?.collabRoomId && (
                          <button
                            onClick={() => navigate(`/notes?room=${encodeURIComponent(post.itemData.collabRoomId)}`)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                          >
                            <span>Open Collab</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {post.category === 'code' && (
                      <div className="rounded-2xl bg-base border border-border-subtle p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border-subtle/60 pb-1.5">
                          <span className="text-accent font-semibold">{post.itemData?.name || 'algorithm.js'}</span>
                          <span className="uppercase text-[10px]">{post.itemData?.language || 'JS'}</span>
                        </div>
                        <pre className="text-[11px] font-mono text-text-secondary overflow-x-auto max-h-28 p-1">
                          <code>{post.itemData?.code?.slice(0, 300) || '// code snippet'}...</code>
                        </pre>
                      </div>
                    )}

                    {post.category === 'resource' && (
                      <div className="rounded-2xl bg-base border border-border-subtle p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-text-primary truncate">
                              {post.itemData?.name || 'Resource Sheet'}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {post.itemData?.type?.toUpperCase() || 'PDF'} • {post.itemData?.size || '1.5 MB'}
                            </p>
                          </div>
                        </div>
                        {post.itemData?.url && (
                          <a
                            href={post.itemData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-surface hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Tag Pills */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {post.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-lg bg-base text-text-muted text-[10px] font-medium border border-border-subtle/80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Upvote, 1-Click Import & Share */}
                  <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Upvote button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border',
                          hasLiked
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            : 'bg-surface hover:bg-hover border-border-subtle text-text-secondary hover:text-text-primary'
                        )}
                        title="Upvote item"
                      >
                        <Heart className={cn('h-3.5 w-3.5', hasLiked && 'fill-rose-500')} />
                        <span>{likeCount}</span>
                      </button>

                      {/* Copy link */}
                      <button
                        onClick={() => handleCopyLink(post)}
                        className="p-1.5 rounded-xl bg-surface hover:bg-hover border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
                        title="Copy link"
                      >
                        {copiedPostId === post.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Delete button (owner or admin) */}
                      {isOwner && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-xl bg-surface hover:bg-rose-500/10 border border-border-subtle text-text-muted hover:text-rose-500 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 1-Click Import to user's workspace */}
                    <button
                      onClick={() => handleImportToWorkspace(post)}
                      className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-accent/20 active:scale-95"
                    >
                      {isImportingThis ? (
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {post.category === 'course'
                          ? 'Save Course'
                          : post.category === 'notebook'
                          ? 'Clone Notebook'
                          : post.category === 'code'
                          ? 'Save Code'
                          : 'Save to Library'}
                      </span>
                    </button>
                  </div>

                  {/* Inline Toast Notification on Import */}
                  {importStatus?.id === post.id && (
                    <div
                      className={cn(
                        'p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in',
                        importStatus.success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{importStatus.message}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Share to Community Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-black text-text-primary tracking-tight">
                  Share with Campus Community
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Share lectures, notebooks, cheat sheets or algorithms for everyone to learn from
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 rounded-xl hover:bg-hover text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5">
              {/* Category Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Select Material Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'course', label: 'Course Vault', icon: Youtube, color: 'text-rose-500' },
                    { id: 'notebook', label: 'Notebook', icon: BookOpen, color: 'text-indigo-500' },
                    { id: 'resource', label: 'Resource', icon: FileText, color: 'text-amber-500' },
                    { id: 'code', label: 'Code File', icon: Code2, color: 'text-sky-500' },
                  ].map((cat) => {
                    const Icon = cat.icon
                    const isSelected = shareCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setShareCategory(cat.id)}
                        className={cn(
                          'p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center',
                          isSelected
                            ? 'bg-accent/15 border-accent text-accent shadow-sm'
                            : 'bg-base border-border-subtle text-text-muted hover:text-text-primary hover:bg-hover'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', cat.color)} />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    Title / Topic Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Dynamic Programming Masterclass or LRU Cache in O(1)"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    Description & Learning Takeaways
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a brief explanation, prerequisites, or why this resource is useful..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>

              {/* Category-Specific Form Fields */}
              {shareCategory === 'course' && (
                <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                    <Youtube className="h-4 w-4" />
                    <span>Course Vault Details</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      YouTube Video or Playlist URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={courseUrl}
                      onChange={(e) => setCourseUrl(e.target.value)}
                      className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseIsPlaylist}
                      onChange={(e) => setCourseIsPlaylist(e.target.checked)}
                      className="rounded accent-accent"
                    />
                    <span>This link is a YouTube playlist</span>
                  </label>
                </div>
              )}

              {shareCategory === 'notebook' && (
                <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                    <BookOpen className="h-4 w-4" />
                    <span>Notebook Collaboration Details</span>
                  </div>
                  {notebooks.length > 0 && (
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        Select from your existing Notebooks
                      </label>
                      <select
                        value={selectedNotebookId}
                        onChange={(e) => setSelectedNotebookId(e.target.value)}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="">-- Choose one of your notebooks --</option>
                        {notebooks.map((nb) => (
                          <option key={nb.id} value={nb.id}>
                            {nb.title} ({nb.subject || 'DSA'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Collaborative Room ID (Optional for Live Collab)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. collab-koocxf"
                      value={notebookCollabCode}
                      onChange={(e) => setNotebookCollabCode(e.target.value)}
                      className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              {shareCategory === 'resource' && (
                <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                    <FileText className="h-4 w-4" />
                    <span>Resource Document Details</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Document Download or Web Link URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/sheet.pdf"
                      value={resourceDocUrl}
                      onChange={(e) => setResourceDocUrl(e.target.value)}
                      className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">Type</label>
                      <select
                        value={resourceDocType}
                        onChange={(e) => setResourceDocType(e.target.value)}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="doc">Word / Google Doc</option>
                        <option value="sheet">Spreadsheet</option>
                        <option value="notes">Notes / Article</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 2.4 MB"
                        value={resourceDocSize}
                        onChange={(e) => setResourceDocSize(e.target.value)}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {shareCategory === 'code' && (
                <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-500">
                    <Code2 className="h-4 w-4" />
                    <span>Code Playground Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        File Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. lru-cache.js"
                        value={codeFileName}
                        onChange={(e) => setCodeFileName(e.target.value)}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        Language
                      </label>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="typescript">TypeScript</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Code Snippet
                    </label>
                    <textarea
                      rows={5}
                      placeholder="// Paste your algorithm or solution implementation here..."
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="w-full bg-surface border border-border-subtle rounded-xl p-3 text-xs font-mono text-text-primary focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DSA, Trees, Striver, LeetCode, Placement"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className="w-full bg-base border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent/25 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Publish to Community</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
