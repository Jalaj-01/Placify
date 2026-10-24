import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Share2, Trash2, Download, Loader2, Youtube, Bookmark,
  FileText, Code2, AlertCircle, Sparkles, Eye, X, Package,
  Send, Users, MailOpen, BookOpen, ExternalLink, Check, Search, Plus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import {
  subscribeSharesAndInvites, deleteShareOrInvite,
  addCourseDoc, addBookmarkDoc, addLibraryDoc, addProblem,
  savePlaygroundFile, importEntirePreparation, shareEntirePreparation,
  sendInvite
} from '@/services/firestoreService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function Shares() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'all'

  const {
    openGroupStudy,
    pendingInvites: socketInvites,
    removeInvite: removeSocketInvite,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState(initialTab) // 'all' | 'invites' | 'shares'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [importingId, setImportingId] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [viewingShare, setViewingShare] = useState(null)

  // Share Prep Modal
  const [showSharePrepDialog, setShowSharePrepDialog] = useState(false)
  const [sharePrepEmail, setSharePrepEmail] = useState('')
  const [sharingPrep, setSharingPrep] = useState(false)

  // Direct Invite Modal
  const [showDirectInviteDialog, setShowDirectInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteType, setInviteType] = useState('study') // 'study' | 'notebook'
  const [inviteRoomCode, setInviteRoomCode] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  // Sync tab with query param
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'all' || tab === 'invites' || tab === 'shares')) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'all' ? {} : { tab })
  }

  // 1. Unified Real-Time Subscription
  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = subscribeSharesAndInvites(user.uid, ({ combined }) => {
      setItems(combined || [])
      setLoading(false)
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [user?.uid])

  // 2. Consolidate Firestore items with real-time socket invites
  const allConsolidatedItems = useMemo(() => {
    const seen = new Set()
    const result = []

    // A. Real-time socket invites first
    socketInvites.forEach((inv) => {
      const cleanRoom = inv.roomId ? String(inv.roomId).trim().replace(/^#+/, '').toLowerCase() : null
      const key = cleanRoom ? `room-${cleanRoom}` : `sock-${inv.id || Math.random()}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push({
          id: inv.id || inv.roomId,
          uniqueKey: key,
          source: 'socket',
          type: inv.type || 'study',
          roomId: cleanRoom,
          title: inv.title || (inv.type === 'notebook' ? 'Collaborative Notebook Session' : 'Live Group Study Room'),
          senderName: inv.fromName || 'Peer',
          senderEmail: inv.senderEmail || '',
          createdAt: { toDate: () => new Date() },
        })
      }
    })

    // B. Persistent items from Firestore
    items.forEach((item) => {
      const cleanRoom = item.roomId ? String(item.roomId).trim().replace(/^#+/, '').toLowerCase() : null
      const key = cleanRoom ? `room-${cleanRoom}` : (item.uniqueKey || `item-${item.id}`)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    })

    return result
  }, [items, socketInvites])

  // 3. Filtered Items based on Tab & Search
  const filteredItems = useMemo(() => {
    return allConsolidatedItems.filter((item) => {
      const isInvite =
        item.type === 'study' ||
        item.type === 'notebook' ||
        item.itemType === 'notebook' ||
        Boolean(item.roomId)

      if (activeTab === 'invites' && !isInvite) return false
      if (activeTab === 'shares' && isInvite) return false

      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const title = (item.title || item.itemData?.name || item.itemData?.title || '').toLowerCase()
      const sender = (item.senderEmail || item.senderName || '').toLowerCase()
      const itemType = (item.itemType || item.type || '').toLowerCase()
      return title.includes(query) || sender.includes(query) || itemType.includes(query)
    })
  }, [allConsolidatedItems, activeTab, searchQuery])

  // Counts
  const counts = useMemo(() => {
    let invites = 0
    let shares = 0
    allConsolidatedItems.forEach((item) => {
      const isInvite =
        item.type === 'study' ||
        item.type === 'notebook' ||
        item.itemType === 'notebook' ||
        Boolean(item.roomId)
      if (isInvite) invites++
      else shares++
    })
    return { all: allConsolidatedItems.length, invites, shares }
  }, [allConsolidatedItems])

  // Action: Import Shared Resource
  const handleImport = async (item) => {
    setImportingId(item.id)
    setError('')
    setSuccessMsg('')
    try {
      const data = item.itemData || {}
      const itemType = item.itemType || item.type

      if (itemType === 'course') {
        await addCourseDoc(user.uid, data.name, data.url, data.embedId, data.isPlaylist)
        setSuccessMsg(`Successfully imported course "${data.name}" into Course Vault!`)
      } else if (itemType === 'bookmark') {
        await addBookmarkDoc(user.uid, data.title, data.url, data.category, data.description, data.tags)
        setSuccessMsg(`Successfully imported bookmark "${data.title}"!`)
      } else if (itemType === 'library') {
        await addLibraryDoc(user.uid, data.name, data.url, data.type, data.size)
        setSuccessMsg(`Successfully imported document "${data.name}" into Resource Library!`)
      } else if (itemType === 'problem') {
        await addProblem(user.uid, data)
        setSuccessMsg(`Successfully imported problem "${data.title}" into Problem Log!`)
      } else if (itemType === 'playground') {
        await savePlaygroundFile(user.uid, null, data.name, data.code)
        setSuccessMsg(`Successfully imported playground file "${data.name}"!`)
      } else if (itemType === 'preparation') {
        await importEntirePreparation(user.uid, data)
        setSuccessMsg(`Successfully imported entire preparation package!`)
      }

      // Clean up item from both collections
      await deleteShareOrInvite(user.uid, item)
      if (item.source === 'socket' && item.roomId) {
        removeSocketInvite(item.roomId)
      }
    } catch (err) {
      setError('Failed to import: ' + err.message)
    } finally {
      setImportingId(null)
    }
  }

  // Action: Join or Accept Invite
  const handleJoinInvite = (item) => {
    if (item.type === 'notebook' || item.itemType === 'notebook') {
      const room = item.roomId || item.itemData?.collabRoomId
      if (room) {
        navigate(`/notes?room=${encodeURIComponent(room)}`)
      } else {
        navigate('/notes')
      }
    } else {
      openGroupStudy(item.roomId)
    }
    // Clean up
    deleteShareOrInvite(user.uid, item).catch(() => {})
    if (item.source === 'socket' && item.roomId) {
      removeSocketInvite(item.roomId)
    }
  }

  // Action: Delete / Dismiss Item
  const handleDelete = async (item) => {
    setError('')
    setSuccessMsg('')
    try {
      await deleteShareOrInvite(user.uid, item)
      if (item.source === 'socket' && item.roomId) {
        removeSocketInvite(item.roomId)
      }
      setSuccessMsg('Item dismissed.')
      setTimeout(() => setSuccessMsg(''), 2500)
    } catch (err) {
      setError('Failed to dismiss: ' + err.message)
    }
  }

  // Action: Send Preparation
  const handleSharePreparation = async (e) => {
    e.preventDefault()
    if (!sharePrepEmail.trim()) return
    setSharingPrep(true)
    setError('')
    setSuccessMsg('')

    try {
      await shareEntirePreparation(user.uid, user.email, sharePrepEmail.trim())
      setSuccessMsg(`Successfully shared your entire preparation with ${sharePrepEmail.trim()}!`)
      setSharePrepEmail('')
      setShowSharePrepDialog(false)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError('Failed to share preparation: ' + err.message)
    } finally {
      setSharingPrep(false)
    }
  }

  // Action: Send Direct Invite (Study Room or Notebook)
  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setSendingInvite(true)
    setError('')
    setSuccessMsg('')

    try {
      const roomCode = inviteRoomCode.trim() || `room-${Date.now().toString(36).slice(-4)}`
      await sendInvite(user, inviteEmail.trim(), {
        type: inviteType,
        roomId: roomCode,
        title: inviteType === 'notebook' ? 'Collaborative Notebook Session' : 'Live Group Study Room',
        itemType: inviteType,
      })
      setSuccessMsg(`Invitation successfully dispatched to ${inviteEmail.trim()}!`)
      setInviteEmail('')
      setInviteRoomCode('')
      setShowDirectInviteDialog(false)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError('Failed to send invite: ' + err.message)
    } finally {
      setSendingInvite(false)
    }
  }

  const getItemIcon = (item) => {
    const isInvite =
      item.type === 'study' ||
      item.type === 'notebook' ||
      item.itemType === 'notebook' ||
      Boolean(item.roomId)

    if (item.type === 'notebook' || item.itemType === 'notebook') {
      return <BookOpen className="h-5 w-5 text-indigo-500" />
    }
    if (isInvite) {
      return <Users className="h-5 w-5 text-emerald-500" />
    }

    switch (item.itemType) {
      case 'course':
        return <Youtube className="h-5 w-5 text-red-500" />
      case 'bookmark':
        return <Bookmark className="h-5 w-5 text-blue-500" />
      case 'library':
        return <FileText className="h-5 w-5 text-indigo-500" />
      case 'problem':
        return <Code2 className="h-5 w-5 text-emerald-500" />
      case 'playground':
        return <Code2 className="h-5 w-5 text-purple-500" />
      case 'preparation':
        return <Package className="h-5 w-5 text-amber-500" />
      default:
        return <Share2 className="h-5 w-5 text-slate-500" />
    }
  }

  const getItemBadge = (item) => {
    if (item.type === 'notebook' || item.itemType === 'notebook') {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
          Notebook Invite
        </span>
      )
    }
    if (item.type === 'study' || (item.roomId && !item.itemType)) {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          Study Room Invite
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        {item.itemType || 'Resource'}
      </span>
    )
  }

  const renderViewContent = (item) => {
    const data = item.itemData || {}
    switch (item.itemType) {
      case 'library': {
        const isPdf = data.type?.includes('pdf') || data.name?.endsWith('.pdf')
        const isImage = data.type?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(data.name || '')
        if (isPdf && data.url) {
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.url)}&embedded=true`
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800 truncate">{data.name}</p>
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">Open in tab ↗</a>
              </div>
              <iframe src={googleViewerUrl} title={data.name} className="w-full rounded-xl border border-slate-200 bg-white" style={{ height: '60vh' }} />
            </div>
          )
        }
        if (isImage && data.url) {
          return (
            <div className="space-y-2">
              <img src={data.url} alt={data.name} className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-200 bg-white" />
            </div>
          )
        }
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <FileText className="h-16 w-16 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">{data.name}</p>
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-white bg-slate-900 px-4 py-2 rounded-xl">
              Open File ↗
            </a>
          </div>
        )
      }
      case 'course': {
        const embedUrl = data.isPlaylist
          ? `https://www.youtube.com/embed/videoseries?list=${data.embedId}`
          : `https://www.youtube.com/embed/${data.embedId}`
        return (
          <div className="space-y-2">
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
              <iframe src={embedUrl} title={data.name} className="w-full h-full" allowFullScreen />
            </div>
          </div>
        )
      }
      case 'bookmark': {
        return (
          <div className="space-y-3">
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-all">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{data.title}</p>
                <p className="text-xs text-indigo-600 truncate mt-0.5">{data.url}</p>
                {data.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{data.description}</p>}
              </div>
            </a>
          </div>
        )
      }
      case 'problem': {
        return (
          <div className="space-y-3">
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-400 transition-all">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{data.title}</p>
                <p className="text-xs text-emerald-600 truncate mt-0.5">{data.url}</p>
              </div>
            </a>
            {data.notes && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
          </div>
        )
      }
      case 'playground': {
        return (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <pre className="text-xs font-mono p-4 bg-slate-900 text-emerald-400 overflow-x-auto max-h-[50vh]">
              {data.code}
            </pre>
          </div>
        )
      }
      case 'preparation': {
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Topics', value: data.topics?.length || 0 },
                { label: 'Courses', value: data.courses?.length || 0 },
                { label: 'Problems', value: data.problems?.length || 0 },
                { label: 'Bookmarks', value: data.bookmarks?.length || 0 },
                { label: 'Library', value: data.library?.length || 0 },
                { label: 'Scripts', value: data.playground?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )
      }
      default:
        return <p className="text-sm text-slate-600">No additional preview available.</p>
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ─── Page Header & Quick Actions ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Share2 className="h-6 w-6 text-slate-800" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shares & Invites</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review live study rooms, collaborative notebooks, and shared vault materials in one place
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowDirectInviteDialog(true)}
            className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-xl px-3.5 py-2 font-semibold"
          >
            <Plus className="h-4 w-4" /> Send Invite
          </Button>

          <Button
            size="sm"
            onClick={() => setShowSharePrepDialog(true)}
            variant="outline"
            className="flex items-center gap-1.5 text-xs border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-3.5 py-2 font-semibold shadow-sm"
          >
            <Send className="h-3.5 w-3.5 text-indigo-500" /> Share Preparation
          </Button>
        </div>
      </div>

      {/* ─── Metric Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p3d-card rounded-2xl border border-white/95 bg-white/90 p-4 shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-md">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total In Inbox</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{counts.all}</span>
            <span className="text-xs font-semibold text-slate-500">activities</span>
          </div>
        </div>

        <div className="p3d-card rounded-2xl border border-white/95 bg-white/90 p-4 shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-md">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Pending Invites</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{counts.invites}</span>
            <span className="text-xs font-semibold text-slate-500">rooms & notes</span>
          </div>
        </div>

        <div className="p3d-card rounded-2xl border border-white/95 bg-white/90 p-4 shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-md">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Shared Vault Items</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{counts.shares}</span>
            <span className="text-xs font-semibold text-slate-500">ready to import</span>
          </div>
        </div>
      </div>

      {/* ─── Alerts & Status Notifications ───────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold shadow-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── Segmented Tabs & Search Controls ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl border border-white/90 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Items', count: counts.all },
            { id: 'invites', label: 'Invites', count: counts.invites },
            { id: 'shares', label: 'Shared Vault', count: counts.shares },
          ].map(({ id, label, count }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items or peers..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* ─── Items Grid Feed ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-slate-600 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white/90 rounded-2xl border border-white/95 shadow-sm max-w-lg mx-auto p-6 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <MailOpen className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your inbox is clear</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {searchQuery
              ? 'No shares or invites match your search filter.'
              : 'When classmates invite you to study rooms, collaborate on notebooks, or share courses and problems, they will appear right here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isInvite =
              item.type === 'study' ||
              item.type === 'notebook' ||
              item.itemType === 'notebook' ||
              Boolean(item.roomId)

            const displayTitle =
              item.title ||
              item.itemData?.title ||
              item.itemData?.name ||
              (isInvite ? 'Live Collaboration Session' : 'Shared Resource')

            const senderText = item.senderEmail || item.senderName || 'Peer'

            return (
              <div
                key={item.uniqueKey || item.id}
                className="p3d-card flex flex-col justify-between rounded-2xl border border-white/95 bg-white/95 p-4 shadow-[0_8px_24px_rgba(31,41,55,0.06)] backdrop-blur-md"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                    {getItemIcon(item)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate" title={displayTitle}>
                        {displayTitle}
                      </span>
                      {getItemBadge(item)}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {isInvite ? (
                        <>
                          Room Code:{' '}
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                            #{item.roomId || 'live'}
                          </code>
                        </>
                      ) : (
                        item.itemData?.category || item.itemData?.platform || item.itemData?.type || 'Available to import'
                      )}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      From <span className="font-semibold text-slate-700">{senderText}</span>
                    </p>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="h-8 px-2.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Dismiss
                  </Button>

                  <div className="flex items-center gap-2">
                    {!isInvite && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingShare(item)}
                        className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" /> Preview
                      </Button>
                    )}

                    {isInvite ? (
                      <Button
                        size="sm"
                        onClick={() => handleJoinInvite(item)}
                        className="h-8 px-3.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                      >
                        {item.type === 'notebook' || item.itemType === 'notebook' ? (
                          <>
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Open Notebook
                          </>
                        ) : (
                          <>
                            <Users className="h-3.5 w-3.5 mr-1.5" /> Join Room
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleImport(item)}
                        disabled={importingId === item.id}
                        className="h-8 px-3.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm"
                      >
                        {importingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Import to Vault
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Preview Modal ──────────────────────────────────────── */}
      <Dialog open={Boolean(viewingShare)} onOpenChange={(val) => !val && setViewingShare(null)}>
        <DialogContent className="sm:max-w-[560px] bg-white border border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              {viewingShare?.itemData?.name || viewingShare?.itemData?.title || viewingShare?.title || 'Resource Details'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Shared by {viewingShare?.senderEmail || 'Peer'}
            </DialogDescription>
          </DialogHeader>

          {viewingShare && (
            <div className="space-y-4 pt-1">
              {renderViewContent(viewingShare)}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setViewingShare(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const toImport = viewingShare
                    setViewingShare(null)
                    handleImport(toImport)
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Import
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Direct Invite Modal ─────────────────────────────────── */}
      <Dialog open={showDirectInviteDialog} onOpenChange={(val) => !sendingInvite && setShowDirectInviteDialog(val)}>
        <DialogContent className="sm:max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Invite Peer to Live Session
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Instantly route an invite to a classmate's Placify command center.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 font-bold uppercase">Session Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInviteType('study')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inviteType === 'study'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" /> Group Study
                </button>
                <button
                  type="button"
                  onClick={() => setInviteType('notebook')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inviteType === 'notebook'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Notebook Collab
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 font-bold uppercase">Peer's Email Address</label>
              <Input
                type="email"
                placeholder="classmate@campus.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                disabled={sendingInvite}
                className="bg-slate-50 border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 font-bold uppercase">Custom Room Code (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. dsa-prep-2026"
                value={inviteRoomCode}
                onChange={(e) => setInviteRoomCode(e.target.value)}
                disabled={sendingInvite}
                className="bg-slate-50 border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDirectInviteDialog(false)}
                disabled={sendingInvite}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={sendingInvite || !inviteEmail.trim()}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {sendingInvite ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Share Preparation Dialog ────────────────────────────── */}
      <Dialog open={showSharePrepDialog} onOpenChange={(val) => !sharingPrep && setShowSharePrepDialog(val)}>
        <DialogContent className="sm:max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Share Your Entire Preparation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Packages all your topics, courses, problems, bookmarks, and library documents into a single vault package for a peer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSharePreparation} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 font-bold uppercase">Recipient Email</label>
              <Input
                type="email"
                placeholder="peer@campus.edu"
                value={sharePrepEmail}
                onChange={(e) => setSharePrepEmail(e.target.value)}
                required
                disabled={sharingPrep}
                className="bg-slate-50 border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSharePrepDialog(false)}
                disabled={sharingPrep}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={sharingPrep || !sharePrepEmail.trim()}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {sharingPrep ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                Share Preparation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
