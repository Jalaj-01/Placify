import { useState, useEffect } from 'react'
import { Share2, Trash2, Download, Loader2, Youtube, Bookmark, FileText, Code2, AlertCircle, Sparkles, Eye, X, Package, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeShares, deleteShare, addCourseDoc, addBookmarkDoc, addLibraryDoc, addProblem, savePlaygroundFile, importEntirePreparation, shareEntirePreparation } from '@/services/firestoreService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function Shares() {
  const { user } = useAuth()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [viewingShare, setViewingShare] = useState(null)
  const [showSharePrepDialog, setShowSharePrepDialog] = useState(false)
  const [sharePrepEmail, setSharePrepEmail] = useState('')
  const [sharingPrep, setSharingPrep] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = subscribeShares(user.uid, (data) => {
      setShares(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const handleImport = async (share) => {
    setImportingId(share.id)
    setError('')
    setSuccessMsg('')
    try {
      const data = share.itemData
      if (share.itemType === 'course') {
        await addCourseDoc(user.uid, data.name, data.url, data.embedId, data.isPlaylist)
        setSuccessMsg(`Successfully imported course "${data.name}"!`)
      } else if (share.itemType === 'bookmark') {
        await addBookmarkDoc(user.uid, data.title, data.url, data.category, data.description, data.tags)
        setSuccessMsg(`Successfully imported bookmark "${data.title}"!`)
      } else if (share.itemType === 'library') {
        await addLibraryDoc(user.uid, data.name, data.url, data.type, data.size)
        setSuccessMsg(`Successfully imported document "${data.name}"!`)
      } else if (share.itemType === 'problem') {
        await addProblem(user.uid, data)
        setSuccessMsg(`Successfully imported problem "${data.title}"!`)
      } else if (share.itemType === 'playground') {
        await savePlaygroundFile(user.uid, null, data.name, data.code)
        setSuccessMsg(`Successfully imported playground file "${data.name}"!`)
      } else if (share.itemType === 'preparation') {
        await importEntirePreparation(user.uid, data)
        setSuccessMsg(`Successfully imported entire preparation!`)
      }

      // Auto delete the share document on import
      await deleteShare(user.uid, share.id)
    } catch (err) {
      setError('Failed to import: ' + err.message)
    } finally {
      setImportingId(null)
    }
  }

  const handleDelete = async (shareId) => {
    setError('')
    setSuccessMsg('')
    try {
      await deleteShare(user.uid, shareId)
    } catch (err) {
      setError('Failed to delete share: ' + err.message)
    }
  }

  const handleSharePreparation = async (e) => {
    e.preventDefault()
    if (!sharePrepEmail.trim()) return
    setSharingPrep(true)
    setError('')
    setSuccessMsg('')

    try {
      await shareEntirePreparation(user.uid, user.email, sharePrepEmail.trim())
      setSuccessMsg('Successfully shared your entire preparation!')
      setSharePrepEmail('')
      setShowSharePrepDialog(false)
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    } catch (err) {
      setError('Failed to share preparation: ' + err.message)
    } finally {
      setSharingPrep(false)
    }
  }

  const getShareIcon = (type) => {
    switch (type) {
      case 'course': return <Youtube className="h-5 w-5 text-semantic-red" />
      case 'bookmark': return <Bookmark className="h-5 w-5 text-semantic-blue" />
      case 'library': return <FileText className="h-5 w-5 text-accent-light" />
      case 'problem': return <Code2 className="h-5 w-5 text-semantic-green" />
      case 'playground': return <Code2 className="h-5 w-5 text-semantic-purple" />
      case 'preparation': return <Package className="h-5 w-5 text-semantic-orange" />
      default: return <Share2 className="h-5 w-5 text-text-muted" />
    }
  }

  const getShareTitle = (share) => {
    const data = share.itemData
    return data.name || data.title || 'Untitled Shared Item'
  }

  const getItemTypeName = (type) => {
    switch (type) {
      case 'course': return 'Course'
      case 'bookmark': return 'Bookmark'
      case 'problem': return 'Problem'
      case 'library': return 'Resource Document'
      case 'playground': return 'Playground File'
      case 'preparation': return 'Preparation Package'
      default: return 'Item'
    }
  }

  const getShareSub = (share) => {
    switch (share.itemType) {
      case 'course': return share.itemData.isPlaylist ? 'Course Playlist' : 'Single Video Course'
      case 'bookmark': return `Bookmark under "${share.itemData.category || 'General'}"`
      case 'library': return `Resource Document (${share.itemData.type || 'unknown'})`
      case 'problem': return `Problem Log (${share.itemData.platform || 'LeetCode'} • ${share.itemData.difficulty || 'Medium'})`
      case 'playground': return `Playground Script (${share.itemData.name})`
      case 'preparation': return `Complete Preparation Package (${share.itemData.topics?.length || 0} topics, ${share.itemData.courses?.length || 0} courses, ${share.itemData.problems?.length || 0} problems)`
      default: return 'Shared Resource'
    }
  }

  const renderViewContent = (share) => {
    const data = share.itemData

    switch (share.itemType) {

      case 'library': {
        const isPdf = data.type?.includes('pdf') || data.name?.endsWith('.pdf')
        const isImage = data.type?.startsWith('image/') ||
          /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(data.name || '')

        if (isPdf && data.url) {
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.url)}&embedded=true`
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-primary truncate">{data.name}</p>
                <a href={data.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-accent-light hover:underline shrink-0 ml-2">Open in tab ↗</a>
              </div>
              <iframe
                src={googleViewerUrl}
                title={data.name}
                className="w-full rounded-lg border border-border-subtle bg-surface"
                style={{ height: '60vh' }}
              />
              <p className="text-[10px] text-text-muted text-center">
                If the preview is blank, <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">open in a new tab ↗</a>
              </p>
            </div>
          )
        }

        if (isImage && data.url) {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-primary truncate">{data.name}</p>
                <a href={data.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-accent-light hover:underline shrink-0 ml-2">Open in tab ↗</a>
              </div>
              <img
                src={data.url}
                alt={data.name}
                className="w-full max-h-[60vh] object-contain rounded-lg border border-border-subtle bg-surface"
              />
            </div>
          )
        }

        // Generic file — show open link prominently
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <FileText className="h-16 w-16 text-text-muted/50" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-text-primary">{data.name}</p>
              <p className="text-xs text-text-muted">{data.type || 'Unknown type'}</p>
            </div>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent-light px-4 py-2 rounded-lg transition-colors"
            >
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
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-text-primary truncate">{data.name}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-accent/10 text-accent-light border border-accent/20 shrink-0 ml-2">
                {data.isPlaylist ? 'Playlist' : 'Video'}
              </span>
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-border-subtle bg-black">
              <iframe
                src={embedUrl}
                title={data.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )
      }

      case 'bookmark': {
        return (
          <div className="space-y-3">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 rounded-xl border border-border-subtle bg-surface hover:border-accent/40 transition-all"
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${new URL(data.url).hostname}&sz=32`}
                alt=""
                className="h-8 w-8 rounded shrink-0 mt-0.5"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary group-hover:text-accent-light transition-colors truncate">{data.title}</p>
                <p className="text-[11px] text-accent-light truncate mt-0.5">{data.url}</p>
                {data.description && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{data.description}</p>}
              </div>
              <span className="text-accent-light shrink-0 text-lg group-hover:translate-x-0.5 transition-transform">↗</span>
            </a>
            <div className="flex items-center gap-2 flex-wrap">
              {data.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-text-secondary font-medium">
                  {data.category}
                </span>
              )}
              {data.tags?.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )
      }

      case 'problem': {
        const diffColor = {
          Easy: 'text-semantic-green border-semantic-green/30 bg-semantic-green/10',
          Medium: 'text-semantic-yellow border-semantic-yellow/30 bg-semantic-yellow/10',
          Hard: 'text-semantic-red border-semantic-red/30 bg-semantic-red/10',
        }[data.difficulty] || 'text-text-secondary border-border-subtle bg-surface'

        return (
          <div className="space-y-3">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-4 rounded-xl border border-border-subtle bg-surface hover:border-accent/40 transition-all"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary group-hover:text-accent-light transition-colors">{data.title}</p>
                <p className="text-[11px] text-accent-light truncate mt-0.5">{data.url}</p>
              </div>
              <span className="text-accent-light shrink-0 text-lg">↗</span>
            </a>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${diffColor}`}>
                {data.difficulty || 'Medium'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-text-secondary font-medium">
                {data.platform || 'LeetCode'}
              </span>
              {data.tag && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light font-medium">
                  {data.tag}
                </span>
              )}
            </div>
            {data.notes && (
              <div className="bg-surface rounded-lg border border-border-subtle p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">{data.notes}</p>
              </div>
            )}
          </div>
        )
      }

      case 'playground': {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">{data.name}</span>
              {data.language && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-accent/10 text-accent-light border border-accent/20">
                  {data.language}
                </span>
              )}
            </div>
            <div className="rounded-xl border border-border-subtle overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border-subtle/60">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Source Code</span>
              </div>
              <pre className="text-xs text-semantic-green font-mono p-4 bg-base overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                {data.code}
              </pre>
            </div>
          </div>
        )
      }

      case 'preparation': {
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Topics', value: data.topics?.length || 0, color: 'text-accent-light' },
                { label: 'Courses', value: data.courses?.length || 0, color: 'text-semantic-red' },
                { label: 'Problems', value: data.problems?.length || 0, color: 'text-semantic-green' },
                { label: 'Bookmarks', value: data.bookmarks?.length || 0, color: 'text-semantic-blue' },
                { label: 'Library', value: data.library?.length || 0, color: 'text-accent-light' },
                { label: 'Scripts', value: data.playground?.length || 0, color: 'text-semantic-purple' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface p-3 rounded-lg border border-border-subtle text-center">
                  <p className="text-micro text-text-muted font-semibold uppercase">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-secondary bg-surface/50 p-3 rounded-lg border border-border-subtle/50">
              📦 This is a complete preparation package. Importing will merge all items into your account.
            </p>
          </div>
        )
      }

      default:
        return <p className="text-sm text-text-secondary">Unknown item type</p>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <Share2 className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary">Shared Inbox</h1>
            <p className="text-secondary text-text-secondary">Review and import courses, problems, bookmarks, or docs shared with you by other users</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setShowSharePrepDialog(true)}
          className="flex items-center gap-1.5 text-xs bg-elevated border border-border text-text-primary hover:bg-hover"
          variant="outline"
        >
          <Send className="h-4 w-4 text-accent-light" /> Share My Preparation
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-semantic-red/10 border border-semantic-red/25 text-xs text-semantic-red font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-semantic-green/10 border border-semantic-green/25 text-xs text-semantic-green font-medium">
          <Sparkles className="h-4 w-4 shrink-0 text-semantic-green" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      ) : shares.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border-subtle max-w-xl mx-auto space-y-4 shadow-sm">
          <Share2 className="h-16 w-16 text-text-muted/65 mx-auto stroke-[1.25]" />
          <div className="space-y-1.5">
            <h3 className="text-body font-bold text-text-primary">Inbox is clean</h3>
            <p className="text-secondary text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              Nothing shared with you yet. Give another user your logged-in email address to receive resources.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shares.map((share) => (
            <Card key={share.id} className="border border-border-subtle bg-card hover:border-border-hover transition-all">
              <CardContent className="p-4 flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border-subtle shrink-0">
                  {getShareIcon(share)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-text-primary truncate block" title={getShareTitle(share)}>
                      {getShareTitle(share)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-surface border border-border-subtle text-text-secondary shrink-0">
                      {share.itemType}
                    </span>
                  </div>

                  <p className="text-[10px] text-text-secondary truncate">{getShareSub(share)}</p>
                  
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-text-muted">
                      Shared by <span className="font-semibold text-text-secondary">{share.senderEmail}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted hover:text-accent-light"
                        onClick={() => setViewingShare(share)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted hover:text-semantic-red"
                        onClick={() => handleDelete(share.id)}
                        title="Delete share"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        className="h-8 text-xs flex items-center gap-1 font-semibold"
                        onClick={() => handleImport(share)}
                        disabled={importingId === share.id}
                      >
                        {importingId === share.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Share Dialog */}
      <Dialog open={!!viewingShare} onOpenChange={() => setViewingShare(null)}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] bg-card border border-border-subtle max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">
              {viewingShare ? getItemTypeName(viewingShare.itemType) : 'Item'}
            </DialogTitle>
            {viewingShare && (
              <p className="text-[10px] text-text-muted">
                Shared by <span className="font-semibold text-text-secondary">{viewingShare.senderEmail}</span>
              </p>
            )}
          </DialogHeader>
          {viewingShare && (
            <div className="space-y-4 pt-1">
              {renderViewContent(viewingShare)}
              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingShare(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setViewingShare(null)
                    handleImport(viewingShare)
                  }}
                  disabled={importingId === viewingShare.id}
                  className="flex items-center gap-1.5"
                >
                  {importingId === viewingShare.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Import
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Preparation Dialog */}
      <Dialog open={showSharePrepDialog} onOpenChange={(val) => {
        if (!sharingPrep) {
          setShowSharePrepDialog(val)
          setError('')
        }
      }}>
        <DialogContent className="sm:max-w-[420px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">
              Share Your Entire Preparation
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Share all your topics, courses, problems, bookmarks, and library documents with another user.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSharePreparation} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Recipient Email</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={sharePrepEmail}
                onChange={(e) => setSharePrepEmail(e.target.value)}
                required
                disabled={sharingPrep}
                className="bg-base border border-border-subtle focus:border-accent text-xs"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                className="flex items-center gap-1.5"
              >
                {sharingPrep ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {sharingPrep ? 'Sharing...' : 'Share Preparation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
