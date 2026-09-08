import { ShieldAlert, Mail, LogOut, AlertOctagon } from 'lucide-react'

export default function BlockedAccountScreen({ user, profile, onSignOut }) {
  const reason = profile?.blockReason || 'Your account has been suspended due to an administrative policy violation or is undergoing review.'
  const adminContact = 'jalajgupta550@gmail.com'

  return (
    <div className="min-h-screen bg-base text-text-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-semantic-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-surface/80 border border-semantic-red/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-semantic-red/15 text-semantic-red border border-semantic-red/30 shadow-inner">
          <ShieldAlert className="h-8 w-8 text-semantic-red animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-semantic-red/10 border border-semantic-red/20 text-semantic-red text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="h-3.5 w-3.5" />
            Access Restricted
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Account Suspended
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your Placify account (<span className="text-text-primary font-mono font-bold">{user?.email}</span>) has been suspended by the platform administrator.
          </p>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle text-left space-y-1.5">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Suspension Notice
          </span>
          <p className="text-xs text-text-primary leading-relaxed font-medium">
            {reason}
          </p>
          {profile?.blockedAt && (
            <p className="text-[10px] text-text-muted pt-1 border-t border-border-subtle/50">
              Suspended on: {new Date(profile.blockedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`mailto:${adminContact}?subject=${encodeURIComponent(`Placify Account Appeal - ${user?.email}`)}&body=${encodeURIComponent(`Hi Administrator,\n\nMy account (${user?.email}) has been suspended. I would like to request a review of my access.\n\nThank you.`)}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
          >
            <Mail className="h-4 w-4" />
            <span>Appeal / Contact Admin</span>
          </a>

          <button
            onClick={onSignOut}
            className="py-2.5 px-4 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary font-bold text-xs flex items-center justify-center gap-2 border border-border-subtle transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
