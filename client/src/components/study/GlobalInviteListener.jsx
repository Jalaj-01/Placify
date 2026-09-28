import { useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { X, UserPlus, Check, BookOpen } from 'lucide-react'

export default function GlobalInviteListener() {
  const { user } = useAuth()
  const socket = useSocket(user?.uid)
  const openGroupStudy = useAppStore((s) => s.openGroupStudy)
  const openNotebooks = useAppStore((s) => s.openNotebooks)
  const { pendingInvites, addInvite, removeInvite } = useAppStore()

  useEffect(() => {
    if (!socket) return

    const handleReceiveInvite = (inviteData) => {
      // prevent duplicates
      const isDuplicate = useAppStore.getState().pendingInvites.some((i) => i.roomId === inviteData.roomId)
      if (!isDuplicate) {
        addInvite(inviteData)
      }
    }

    socket.on('receive-invite', handleReceiveInvite)

    return () => {
      socket.off('receive-invite', handleReceiveInvite)
    }
  }, [socket, addInvite])

  const handleJoin = (invite) => {
    removeInvite(invite.roomId)
    if (invite.type === 'notebook') {
      openNotebooks(invite.roomId)
    } else {
      openGroupStudy(invite.roomId)
    }
  }

  const handleDeny = (invite) => {
    removeInvite(invite.roomId)
  }

  if (pendingInvites.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {pendingInvites.map((invite, idx) => (
        <div key={idx} className="bg-surface border border-accent/40 shadow-2xl shadow-accent/20 rounded-2xl p-4 w-80 animate-in slide-in-from-right-4 text-text-primary backdrop-blur-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center shrink-0">
                {invite.type === 'notebook' ? <BookOpen className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {invite.type === 'notebook' ? 'Notebook Invite' : 'Study Room Invite'}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  <span className="text-text-primary font-semibold">{invite.fromName}</span> invited you to collaborate on{' '}
                  <span className="font-semibold text-accent">{invite.title || 'a Notebook'}</span>.
                </p>
              </div>
            </div>
            <button onClick={() => handleDeny(invite)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleJoin(invite)}
              className="flex-1 bg-accent hover:bg-accent-light text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{invite.type === 'notebook' ? 'Join Notebook' : 'Join Room'}</span>
            </button>
            <button
              onClick={() => handleDeny(invite)}
              className="flex-1 bg-card hover:bg-hover text-text-primary border border-border-subtle text-xs font-bold py-2 rounded-xl transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

