import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { X, UserPlus, Check, MailOpen, Hash, ArrowRight, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function InvitesDrawer() {
  const { invitesDrawerOpen, closeInvitesDrawer, pendingInvites, removeInvite, openGroupStudy } = useAppStore()
  const [manualRoomCode, setManualRoomCode] = useState('')

  const handleJoin = (invite) => {
    removeInvite(invite.roomId)
    openGroupStudy(invite.roomId)
    closeInvitesDrawer()
  }

  const handleDeny = (invite) => {
    removeInvite(invite.roomId)
  }

  const handleManualJoin = (e) => {
    e.preventDefault()
    if (!manualRoomCode.trim()) return
    openGroupStudy(manualRoomCode.trim())
    setManualRoomCode('')
    closeInvitesDrawer()
  }

  if (!invitesDrawerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        onClick={closeInvitesDrawer}
      />
      
      {/* Drawer Panel */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface/95 backdrop-blur-2xl border-l border-border-subtle z-50 shadow-2xl transition-transform duration-300 flex flex-col",
        invitesDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <MailOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Study Room Invites</h2>
              <p className="text-xs text-text-muted">{pendingInvites.length} Pending Live Collaboration</p>
            </div>
          </div>
          <button 
            onClick={closeInvitesDrawer}
            className="p-2 rounded-xl hover:bg-hover text-text-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Join by Room Code Box */}
          <div className="p-4 rounded-2xl bg-base border border-border-subtle space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Hash className="h-3.5 w-3.5 text-accent" />
              <span>Join with Room Code</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Have a room ID from a peer? Paste it below to jump directly into their study room.
            </p>
            <form onSubmit={handleManualJoin} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. room-k8f2"
                value={manualRoomCode}
                onChange={(e) => setManualRoomCode(e.target.value.trim())}
                className="flex-1 bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold transition-colors"
              >
                Join
              </button>
            </form>
          </div>

          {/* Pending Invites List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted px-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Active Room Invitations</span>
              <span className="font-mono">{pendingInvites.length}</span>
            </div>

            {pendingInvites.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface/40 border border-border-subtle text-center space-y-2">
                <MailOpen className="h-8 w-8 text-text-muted mx-auto opacity-50" />
                <p className="text-xs font-bold text-text-primary">No pending room invites</p>
                <p className="text-[11px] text-text-muted max-w-[220px] mx-auto leading-relaxed">
                  When study peers invite you to co-watch lectures or pair-code, their invites will appear here.
                </p>
              </div>
            ) : (
              pendingInvites.map((invite, idx) => (
                <div key={idx} className="bg-card border border-accent/30 rounded-2xl p-4 relative overflow-hidden shadow-md space-y-3 animate-in fade-in">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-accent/20 rounded-xl flex items-center justify-center shrink-0 text-accent">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-text-primary truncate">{invite.fromName}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-mono font-bold">
                          #{invite.roomId}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                        Invited you to collaborate in their Live Study Room (Shared Code & Notes).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => handleJoin(invite)}
                      className="flex-1 bg-accent hover:bg-accent-light text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-accent/20"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept & Join
                    </button>
                    <button 
                      onClick={() => handleDeny(invite)}
                      className="flex-1 bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-bold py-2 rounded-xl transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Shared Inbox link banner */}
          <div className="p-4 rounded-2xl bg-surface/60 border border-border-subtle flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-accent" />
                <span>Looking for shared items?</span>
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Shared problems, notes, and roadmaps are stored in your Shared Inbox.
              </p>
            </div>
            <Link
              to="/shares"
              onClick={closeInvitesDrawer}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-accent font-bold text-xs border border-border-subtle flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Inbox</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
