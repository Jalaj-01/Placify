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
      case 'course':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Course Name</p>
              <p className="text-sm text-text-primary">{data.name}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">URL</p>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline break-all">
                {data.url}
              </a>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Type</p>
              <p className="text-sm text-text-primary">{data.isPlaylist ? 'Playlist' : 'Single Video'}</p>
            </div>
          </div>
        )
      case 'bookmark':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Title</p>
              <p className="text-sm text-text-primary">{data.title}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">URL</p>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline break-all">
                {data.url}
              </a>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Category</p>
              <p className="text-sm text-text-primary">{data.category || 'General'}</p>
            </div>
            {data.description && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Description</p>
                <p className="text-sm text-text-primary">{data.description}</p>
              </div>
            )}
            {data.tags && data.tags.length > 0 && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Tags</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'library':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Document Name</p>
              <p className="text-sm text-text-primary">{data.name}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">URL</p>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline break-all">
                {data.url}
              </a>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Type</p>
              <p className="text-sm text-text-primary">{data.type || 'unknown'}</p>
            </div>
            {data.size && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Size</p>
                <p className="text-sm text-text-primary">{data.size}</p>
              </div>
            )}
          </div>
        )
      case 'problem':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Problem Title</p>
              <p className="text-sm text-text-primary">{data.title}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">URL</p>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline break-all">
                {data.url}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Platform</p>
                <p className="text-sm text-text-primary">{data.platform || 'LeetCode'}</p>
              </div>
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Difficulty</p>
                <p className="text-sm text-text-primary">{data.difficulty || 'Medium'}</p>
              </div>
            </div>
            {data.tag && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Tag</p>
                <p className="text-sm text-text-primary">{data.tag}</p>
              </div>
            )}
            {data.notes && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Notes</p>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
          </div>
        )
      case 'playground':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">File Name</p>
              <p className="text-sm text-text-primary">{data.name}</p>
            </div>
            {data.language && (
              <div>
                <p className="text-micro text-text-muted font-semibold uppercase">Language</p>
                <p className="text-sm text-text-primary capitalize">{data.language}</p>
              </div>
            )}
            <div>
              <p className="text-micro text-text-muted font-semibold uppercase">Code</p>
              <pre className="text-xs text-text-primary bg-surface p-3 rounded-lg border border-border-subtle overflow-x-auto whitespace-pre-wrap">
                {data.code}
              </pre>
            </div>
          </div>
        )
      case 'preparation':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Topics</p>
                <p className="text-lg font-bold text-accent-light">{data.topics?.length || 0}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Courses</p>
                <p className="text-lg font-bold text-semantic-red">{data.courses?.length || 0}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Problems</p>
                <p className="text-lg font-bold text-semantic-green">{data.problems?.length || 0}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Bookmarks</p>
                <p className="text-lg font-bold text-semantic-blue">{data.bookmarks?.length || 0}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Library Docs</p>
                <p className="text-lg font-bold text-accent-light">{data.library?.length || 0}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <p className="text-micro text-text-muted font-semibold uppercase">Playground Files</p>
                <p className="text-lg font-bold text-semantic-purple">{data.playground?.length || 0}</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              This is a complete preparation package. Importing will add all items to your account.
            </p>
          </div>
        )
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
        <DialogContent className="sm:max-w-[500px] bg-card border border-border-subtle max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-body font-bold text-text-primary">
                View {viewingShare ? getItemTypeName(viewingShare.itemType) : 'Item'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-text-muted hover:text-text-primary"
                onClick={() => setViewingShare(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {viewingShare && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border-subtle shrink-0">
                  {getShareIcon(viewingShare.itemType)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{getShareTitle(viewingShare)}</p>
                  <p className="text-[10px] text-text-muted">
                    Shared by <span className="font-semibold text-text-secondary">{viewingShare.senderEmail}</span>
                  </p>
                </div>
              </div>
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
