import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import {
  X, UserPlus, Check, MailOpen, Hash, ArrowRight, Share2, BookOpen,
  Youtube, Bookmark, FileText, Code2, Sparkles, Loader2, CheckCircle2,
  Inbox, Layers
} from 'lucide-react'
import {
  subscribeInvites,
  deleteInviteDoc,
  subscribeShares,
  deleteShare,
  addCourseDoc,
  addBookmarkDoc,
  addLibraryDoc,
  addProblem,
  savePlaygroundFile,
  importEntirePreparation,
  saveNotebook,
} from '@/services/firestoreService'
import { cn } from '@/lib/utils'

export default function InvitesDrawer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    invitesDrawerOpen,
    closeInvitesDrawer,
    pendingInvites: socketInvites,
    removeInvite: removeSocketInvite,
    openGroupStudy,
    openNotebooks,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'notebooks' | 'rooms' | 'shares'
  const [firestoreInvites, setFirestoreInvites] = useState([])
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionInProgressId, setActionInProgressId] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [manualRoomCode, setManualRoomCode] = useState('')

  // 1. Subscribe to real-time user invites from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setFirestoreInvites([])
      setLoading(false)
      return
    }

    const unsubInvites = subscribeInvites(user.uid, (data) => {
      setFirestoreInvites(data || [])
      setLoading(false)
    })

    const unsubShares = subscribeShares(user.uid, (data) => {
      setShares(data || [])
    })

    return () => {
      if (typeof unsubInvites === 'function') unsubInvites()
      if (typeof unsubShares === 'function') unsubShares()
    }
  }, [user?.uid])

  // 2. Consolidate and deduplicate all incoming invites
  const combinedInvites = useMemo(() => {
    const list = []
    const seenKeys = new Set()

    // A. Firestore persistent invites
    firestoreInvites.forEach((inv) => {
      const uniqueKey = inv.roomId ? `room-${inv.roomId}` : `inv-${inv.id}`
      seenKeys.add(uniqueKey)
      list.push({
        ...inv,
        source: 'firestore',
        uniqueKey,
      })
    })

    // B. Real-time socket invites (if not yet saved or duplicate)
    socketInvites.forEach((inv) => {
      const uniqueKey = inv.roomId ? `room-${inv.roomId}` : `sock-${inv.roomId || Math.random()}`
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey)
        list.push({
          ...inv,
          id: inv.id || inv.roomId,
          source: 'socket',
          uniqueKey,
        })
      }
    })

    // C. Shared materials from /shares that don't already have an invite card
    shares.forEach((share) => {
      const shareKey = `share-${share.id}`
      const hasInviteMirror = firestoreInvites.some((fi) => fi.shareDocId === share.id)
      if (!hasInviteMirror && !seenKeys.has(shareKey)) {
        seenKeys.add(shareKey)
        list.push({
          id: share.id,
          uniqueKey: shareKey,
          source: 'shares',
          type: share.itemType === 'notebook' ? 'notebook' : 'share',
          roomId: share.itemData?.collabRoomId || null,
          senderEmail: share.senderEmail,
          senderName: share.senderEmail ? share.senderEmail.split('@')[0] : 'Peer',
          itemType: share.itemType,
          itemData: share.itemData,
          title: share.itemData?.title || share.itemData?.name || `Shared ${share.itemType}`,
          createdAt: share.createdAt,
        })
      }
    })

    return list
  }, [firestoreInvites, socketInvites, shares])

  // Filter based on active tab
  const filteredInvites = useMemo(() => {
    if (activeTab === 'notebooks') {
      return combinedInvites.filter((i) => i.type === 'notebook')
    }
    if (activeTab === 'rooms') {
      return combinedInvites.filter((i) => i.type === 'room' || (!i.type && i.roomId))
    }
    if (activeTab === 'shares') {
      return combinedInvites.filter((i) => i.type === 'share' || i.itemType)
    }
    return combinedInvites
  }, [combinedInvites, activeTab])

  // Total counts
  const counts = useMemo(() => {
    const notebooks = combinedInvites.filter((i) => i.type === 'notebook').length
    const rooms = combinedInvites.filter((i) => i.type === 'room' || (!i.type && i.roomId)).length
    const sharesCount = combinedInvites.filter((i) => i.type === 'share' || i.itemType).length
    return {
      all: combinedInvites.length,
      notebooks,
      rooms,
      shares: sharesCount,
    }
  }, [combinedInvites])

  // ── Accept Action ──
  const handleAccept = async (invite) => {
    setActionInProgressId(invite.uniqueKey)
    setActionMessage(null)

    try {
      if (invite.type === 'notebook' || invite.itemType === 'notebook') {
        const rawRoom = (invite.roomId || invite.itemData?.collabRoomId || '').trim().replace(/^#+/, '')
        const targetRoom = rawRoom.startsWith('collab-') ? rawRoom : (rawRoom ? `collab-${rawRoom}` : null)
        const notebookData = invite.itemData

        if (notebookData && notebookData.id) {
          const finalNb = {
            ...notebookData,
            isCollaborative: true,
            collabRoomId: targetRoom || notebookData.collabRoomId,
          }
          try {
            const existing = JSON.parse(localStorage.getItem('placify_notebooks') || '[]')
            const updated = [finalNb, ...existing.filter((n) => n.id !== finalNb.id && n.collabRoomId !== finalNb.collabRoomId)]
            localStorage.setItem('placify_notebooks', JSON.stringify(updated))
            if (targetRoom) {
              localStorage.setItem(`placify_shared_nb_${targetRoom.toLowerCase()}`, JSON.stringify(finalNb))
            }
            window.dispatchEvent(new Event('placify_notebooks_changed'))
          } catch {}
          if (user?.uid) {
            saveNotebook(user.uid, finalNb).catch(() => {})
          }
        }

        await dismissInvite(invite)
        closeInvitesDrawer()
        if (targetRoom) {
          navigate(`/notes?room=${encodeURIComponent(targetRoom)}`)
        } else {
          openNotebooks()
        }
        return
      } else if (invite.type === 'room' || (!invite.type && invite.roomId)) {
        const targetRoom = invite.roomId
        await dismissInvite(invite)
        closeInvitesDrawer()
        openGroupStudy(targetRoom)
      } else if (invite.type === 'share' || invite.itemType) {
        // Material import
        const data = invite.itemData || {}
        const iType = invite.itemType

        if (iType === 'course') {
          await addCourseDoc(user.uid, data.name, data.url, data.embedId, data.isPlaylist)
          setActionMessage(`Imported course "${data.name}"!`)
        } else if (iType === 'bookmark') {
          await addBookmarkDoc(user.uid, data.title, data.url, data.category, data.description, data.tags)
          setActionMessage(`Imported bookmark "${data.title}"!`)
        } else if (iType === 'library') {
          await addLibraryDoc(user.uid, data.name, data.url, data.type, data.size)
          setActionMessage(`Imported document "${data.name}"!`)
        } else if (iType === 'problem') {
          await addProblem(user.uid, data)
          setActionMessage(`Imported problem "${data.title}"!`)
        } else if (iType === 'playground') {
          await savePlaygroundFile(user.uid, null, data.name, data.code)
          setActionMessage(`Imported code "${data.name}"!`)
        } else if (iType === 'preparation') {
          await importEntirePreparation(user.uid, data)
          setActionMessage(`Imported complete preparation package!`)
        }

        await dismissInvite(invite)
        setTimeout(() => setActionMessage(null), 3000)
      }
    } catch (err) {
      console.error('Failed to accept invite:', err)
      setActionMessage(`Error: ${err.message}`)
    } finally {
      setActionInProgressId(null)
    }
  }

  // ── Decline / Deny Action ──
  const handleDecline = async (invite) => {
    setActionInProgressId(invite.uniqueKey)
    try {
      await dismissInvite(invite)
    } finally {
      setActionInProgressId(null)
    }
  }

  const dismissInvite = async (invite) => {
    // 1. Remove from socket memory
    if (invite.roomId) {
      removeSocketInvite(invite.roomId)
    }

    // 2. Remove from Firestore invites
    if (user?.uid && invite.source === 'firestore' && invite.id) {
      await deleteInviteDoc(user.uid, invite.id)
    }

    // 3. Remove from shares collection if applicable
    if (user?.uid) {
      const shareId = invite.shareDocId || (invite.source === 'shares' ? invite.id : null)
      if (shareId) {
        await deleteShare(user.uid, shareId).catch(() => {})
      }
    }
  }

  const handleManualJoin = (e) => {
    e.preventDefault()
    if (!manualRoomCode.trim()) return
    const code = manualRoomCode.trim().replace(/^#+/, '')
    setManualRoomCode('')
    closeInvitesDrawer()
    if (code.toLowerCase().startsWith('collab-') || code.toLowerCase().startsWith('nb-') || code.toLowerCase().includes('collab')) {
      navigate(`/notes?room=${encodeURIComponent(code)}`)
    } else {
      openGroupStudy(code)
    }
  }

  const getInviteBadge = (invite) => {
    if (invite.type === 'notebook') {
      return {
        icon: BookOpen,
        label: 'Notebook Collab',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      }
    }
    if (invite.type === 'room' || (!invite.type && invite.roomId)) {
      return {
        icon: UserPlus,
        label: 'Live Study Room',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      }
    }
    const it = invite.itemType
    if (it === 'course') {
      return {
        icon: Youtube,
        label: 'Course Vault Video',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      }
    }
    if (it === 'library') {
      return {
        icon: FileText,
        label: 'Resource Document',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      }
    }
    if (it === 'playground') {
      return {
        icon: Code2,
        label: 'Code Playground File',
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      }
    }
    if (it === 'bookmark') {
      return {
        icon: Bookmark,
        label: 'Curated Bookmark',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      }
    }
    return {
      icon: Share2,
      label: 'Shared Material',
      color: 'text-accent bg-accent/10 border-accent/20',
    }
  }

  if (!invitesDrawerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeInvitesDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[460px] bg-surface/98 backdrop-blur-2xl border-l border-border-subtle z-50 shadow-2xl transition-transform duration-300 flex flex-col',
          invitesDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shadow-sm">
              <MailOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text-primary tracking-tight">Invites</h2>
                {counts.all > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">
                    {counts.all}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">
                Collaborative notes, live study rooms & shared items
              </p>
            </div>
          </div>
          <button
            onClick={closeInvitesDrawer}
            className="p-2 rounded-xl hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
            title="Close Invites"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action toast if any */}
        {actionMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Join by Room Code Box */}
          <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Hash className="h-3.5 w-3.5 text-accent" />
              <span>Direct Join with Room Code</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Enter any collaborative Notebook code (e.g. <code className="font-mono text-accent">collab-koocxf</code>) or Study Room ID to join instantly.
            </p>
            <form onSubmit={handleManualJoin} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. collab-koocxf or room-89fa"
                value={manualRoomCode}
                onChange={(e) => setManualRoomCode(e.target.value.trim())}
                className="flex-1 bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold transition-all shadow-md shadow-accent/20 active:scale-95"
              >
                Join
              </button>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-base border border-border-subtle overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.all}</span>
            </button>
            <button
              onClick={() => setActiveTab('notebooks')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === 'notebooks'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <span>Notebooks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.notebooks}</span>
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === 'rooms'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <span>Study Rooms</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.rooms}</span>
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === 'shares'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <span>Shared Materials</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.shares}</span>
            </button>
          </div>

          {/* Invites List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted px-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                {activeTab === 'all'
                  ? 'All Active Invitations'
                  : activeTab === 'notebooks'
                  ? 'Notebook Collaborations'
                  : activeTab === 'rooms'
                  ? 'Live Study Rooms'
                  : 'Shared Items & Materials'}
              </span>
              <span className="font-mono text-xs">{filteredInvites.length}</span>
            </div>

            {loading ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />
                <p className="text-xs text-text-muted">Loading your invites...</p>
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="p-8 rounded-2xl bg-base/50 border border-border-subtle text-center space-y-2.5">
                <MailOpen className="h-10 w-10 text-text-muted mx-auto opacity-40" />
                <p className="text-xs font-bold text-text-primary">No pending invites</p>
                <p className="text-[11px] text-text-muted max-w-[260px] mx-auto leading-relaxed">
                  When study peers or mentors invite you to co-edit notebooks, join study rooms, or share course materials, they will appear here.
                </p>
              </div>
            ) : (
              filteredInvites.map((invite) => {
                const badge = getInviteBadge(invite)
                const BadgeIcon = badge.icon
                const isWorking = actionInProgressId === invite.uniqueKey

                return (
                  <div
                    key={invite.uniqueKey}
                    className="bg-card border border-border-subtle hover:border-accent/40 rounded-2xl p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-accent/15 rounded-xl flex items-center justify-center shrink-0 text-accent">
                        <BadgeIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1',
                              badge.color
                            )}
                          >
                            <BadgeIcon className="h-3 w-3" />
                            <span>{badge.label}</span>
                          </span>
                          {invite.roomId && (
                            <span className="font-mono text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded">
                              #{invite.roomId}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-text-primary mt-1.5 leading-snug">
                          {invite.title || 'Untitled Invite'}
                        </h4>

                        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                          <span>From:</span>
                          <span className="font-semibold text-text-secondary">
                            {invite.senderName || invite.senderEmail || 'Peer'}
                          </span>
                          {invite.senderEmail && (
                            <span className="text-[10px] opacity-70">({invite.senderEmail})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons: Accept / Decline */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(invite)}
                        disabled={isWorking}
                        className="flex-1 bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-accent/20 active:scale-95"
                      >
                        {isWorking ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {invite.type === 'notebook'
                            ? 'Accept & Edit'
                            : invite.type === 'room'
                            ? 'Accept & Join'
                            : 'Accept & Import'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDecline(invite)}
                        disabled={isWorking}
                        className="flex-1 bg-surface hover:bg-hover disabled:opacity-50 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick link to Shared Inbox */}
          <div className="p-4 rounded-2xl bg-base border border-border-subtle flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-accent" />
                <span>Shared Inbox</span>
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                View your archived shared preparation packages, courses, and bookmarks.
              </p>
            </div>
            <button
              onClick={() => {
                closeInvitesDrawer()
                navigate('/shares')
              }}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-hover text-accent font-bold text-xs border border-border-subtle flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Inbox</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
