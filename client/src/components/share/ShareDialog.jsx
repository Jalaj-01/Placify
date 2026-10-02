import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { shareItem, createCommunityPost } from '@/services/firestoreService'
import { AlertCircle, CheckCircle2, Loader2, Send, Users, Mail, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ShareDialog({ open, onOpenChange, itemType, itemData, senderUid, senderEmail }) {
  const [shareMode, setShareMode] = useState('email') // 'email' | 'community'
  const [email, setEmail] = useState('')
  const [communityDesc, setCommunityDesc] = useState('')
  const [communityTags, setCommunityTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getItemTypeName = () => {
    switch (itemType) {
      case 'course': return 'Course Vault Video'
      case 'bookmark': return 'Bookmark'
      case 'problem': return 'Problem Log'
      case 'library': return 'Resource Document'
      case 'playground': return 'Code Playground File'
      case 'notebook': return 'Notebook'
      default: return 'Item'
    }
  }

  const handleShareEmail = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const cleanData = JSON.parse(JSON.stringify(itemData || {}))
      if (cleanData.id) delete cleanData.id

      await shareItem(senderUid, senderEmail, email.trim(), itemType, cleanData)
      setSuccess(`Sent invitation to ${email.trim()}!`)
      setEmail('')
      setTimeout(() => {
        onOpenChange(false)
        setSuccess('')
      }, 1800)
    } catch (err) {
      setError(err.message || 'Failed to share item')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishCommunity = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const cleanData = JSON.parse(JSON.stringify(itemData || {}))
      const title = cleanData.name || cleanData.title || `Curated ${getItemTypeName()}`
      const category = itemType === 'course' ? 'course' : itemType === 'playground' ? 'code' : itemType === 'library' ? 'resource' : 'resource'

      await createCommunityPost(
        { uid: senderUid, email: senderEmail },
        {
          title,
          description: communityDesc.trim() || `Shared from ${getItemTypeName()} for campus peers.`,
          category,
          tags: communityTags || ['Study', 'Campus', itemType],
          itemData: cleanData,
        }
      )

      setSuccess('Successfully published to Campus Community Hub!')
      setTimeout(() => {
        onOpenChange(false)
        setSuccess('')
      }, 1800)
    } catch (err) {
      setError(err.message || 'Failed to publish to community')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!loading) {
        onOpenChange(val)
        setError('')
        setSuccess('')
      }
    }}>
      <DialogContent className="sm:max-w-[440px] bg-card border border-border-subtle p-6 space-y-5">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-black text-text-primary flex items-center justify-between">
            <span>Share {getItemTypeName()}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            "{itemData?.name || itemData?.title || 'This item'}"
          </DialogDescription>
        </DialogHeader>

        {/* Share Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-base border border-border-subtle rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setShareMode('email')}
            className={cn(
              'py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all',
              shareMode === 'email'
                ? 'bg-accent text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Invite via Email</span>
          </button>
          <button
            type="button"
            onClick={() => setShareMode('community')}
            className={cn(
              'py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all',
              shareMode === 'community'
                ? 'bg-accent text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Campus Community</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium p-2.5 rounded-xl bg-semantic-red/10 border border-semantic-red/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-1.5 text-xs text-semantic-green font-medium p-2.5 rounded-xl bg-semantic-green/10 border border-semantic-green/20 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* MODE 1: SEND DIRECT INVITATION BY EMAIL */}
        {shareMode === 'email' && (
          <form onSubmit={handleShareEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                Friend or Peer Email
              </label>
              <Input
                type="email"
                placeholder="friend@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || Boolean(success)}
                className="bg-base border border-border-subtle focus:border-accent text-xs rounded-xl"
              />
              <p className="text-[10px] text-text-muted">
                Your friend will see this invitation in their <strong>Invites</strong> inbox to accept or decline.
              </p>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || Boolean(success) || !email.trim()}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent-light text-white text-xs font-bold"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>{loading ? 'Sending...' : 'Send Invite'}</span>
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* MODE 2: PUBLISH TO CAMPUS COMMUNITY */}
        {shareMode === 'community' && (
          <form onSubmit={handlePublishCommunity} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                  Description / Note for Campus Peers
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is this resource useful? Any tips or takeaways..."
                  value={communityDesc}
                  onChange={(e) => setCommunityDesc(e.target.value)}
                  disabled={loading || Boolean(success)}
                  className="w-full bg-base border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                  Tags (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. DSA, Interview, Revision"
                  value={communityTags}
                  onChange={(e) => setCommunityTags(e.target.value)}
                  disabled={loading || Boolean(success)}
                  className="bg-base border border-border-subtle focus:border-accent text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || Boolean(success)}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent-light text-white text-xs font-bold"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? 'Publishing...' : 'Publish to Community'}</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
