import { useAppStore } from '@/store/useAppStore'
import { X, UserPlus, Check, MailOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InvitesDrawer() {
  const { invitesDrawerOpen, closeInvitesDrawer, pendingInvites, removeInvite, openGroupStudy } = useAppStore()

  const handleJoin = (invite) => {
    removeInvite(invite.roomId)
    openGroupStudy(invite.roomId)
    closeInvitesDrawer()
  }

  const handleDeny = (invite) => {
    removeInvite(invite.roomId)
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
        "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface/95 backdrop-blur-2xl border-l border-border-subtle z-50 shadow-2xl transition-transform duration-300 flex flex-col",
        invitesDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <MailOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Study Invites</h2>
              <p className="text-xs text-text-muted">{pendingInvites.length} Pending</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {pendingInvites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <MailOpen className="h-12 w-12 text-text-muted" />
              <p className="text-sm font-semibold text-text-muted">No pending invites.</p>
              <p className="text-xs text-text-muted max-w-[200px]">When your friends invite you to a room, they'll appear here.</p>
            </div>
          ) : (
            pendingInvites.map((invite, idx) => (
              <div key={idx} className="bg-card border border-border-subtle rounded-2xl p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <UserPlus className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-text-primary">{invite.fromName}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1">Invited you to join their Live Study Room for pairing and notes.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleJoin(invite)}
                    className="flex-1 bg-accent hover:bg-accent-light text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-accent/20"
                  >
                    <Check className="h-4 w-4" /> Join Room
                  </button>
                  <button 
                    onClick={() => handleDeny(invite)}
                    className="flex-1 bg-surface hover:bg-hover text-text-primary border border-border-subtle text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
