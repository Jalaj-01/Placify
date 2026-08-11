import { useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { X, UserPlus, Check } from 'lucide-react'

export default function GlobalInviteListener() {
  const { user } = useAuth()
  const socket = useSocket(user?.uid)
  const openGroupStudy = useAppStore(s => s.openGroupStudy)
  const { pendingInvites, addInvite, removeInvite } = useAppStore()

  useEffect(() => {
    if (!socket) return

    const handleReceiveInvite = (inviteData) => {
      // prevent duplicates
      const isDuplicate = useAppStore.getState().pendingInvites.some(i => i.roomId === inviteData.roomId)
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
    openGroupStudy(invite.roomId)
  }

  const handleDeny = (invite) => {
    removeInvite(invite.roomId)
  }

  if (pendingInvites.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {pendingInvites.map((invite, idx) => (
        <div key={idx} className="bg-surface border border-accent/40 shadow-2xl shadow-accent/20 rounded-xl p-4 w-80 animate-in slide-in-from-right-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Study Room Invite</h4>
                <p className="text-xs text-text-muted mt-0.5"><span className="text-text-primary font-semibold">{invite.fromName}</span> invited you to collaborate.</p>
              </div>
            </div>
            <button onClick={() => handleDeny(invite)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleJoin(invite)}
              className="flex-1 bg-accent hover:bg-accent-light text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="h-3 w-3" /> Join Room
            </button>
            <button 
              onClick={() => handleDeny(invite)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
