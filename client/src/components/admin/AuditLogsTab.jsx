import { Shield, Clock, FileText, User, UserCheck, UserX, Trash2, Bell } from 'lucide-react'

export default function AuditLogsTab({ auditLogs = [] }) {
  const getActionIcon = (action) => {
    switch (action) {
      case 'TEACHER_WHITELIST_ADD':
        return <UserCheck className="h-4 w-4 text-purple-400" />
      case 'TEACHER_WHITELIST_REMOVE':
        return <UserX className="h-4 w-4 text-amber-400" />
      case 'USER_ROLE_CHANGE':
        return <Shield className="h-4 w-4 text-cyan-400" />
      case 'USER_BLOCKED':
        return <UserX className="h-4 w-4 text-semantic-red" />
      case 'USER_UNBLOCKED':
        return <UserCheck className="h-4 w-4 text-emerald-400" />
      case 'USER_DELETED':
        return <Trash2 className="h-4 w-4 text-semantic-red" />
      case 'ANNOUNCEMENT_CREATED':
      case 'ANNOUNCEMENT_DELETED':
        return <Bell className="h-4 w-4 text-blue-400" />
      default:
        return <FileText className="h-4 w-4 text-text-muted" />
    }
  }

  const formatAction = (action) => {
    return (action || 'ACTION').replace(/_/g, ' ')
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle backdrop-blur-xl">
        <h2 className="text-xl font-black text-text-primary">Administrative Audit Trail</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Immutable event stream capturing all administrative actions, faculty approvals, and user governance events.
        </p>
      </div>

      <div className="rounded-3xl border border-border-subtle bg-surface/40 backdrop-blur-xl overflow-hidden shadow-xl">
        {auditLogs.length === 0 ? (
          <div className="p-10 text-center text-text-muted">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-text-primary text-sm">No administrative logs recorded yet</p>
            <p className="text-xs text-text-secondary mt-0.5">Admin activities like whitelisting teachers or modifying user roles will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle/40">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex items-start gap-4">
                <div className="h-9 w-9 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {getActionIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-black text-xs text-text-primary uppercase tracking-wider font-mono">
                      {formatAction(log.action)}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary">
                    Executed by: <span className="font-mono text-text-primary font-bold">{log.adminEmail || 'admin'}</span>
                  </p>

                  {log.details && (
                    <div className="p-2.5 rounded-xl bg-base/80 border border-border-subtle text-[11px] font-mono text-text-secondary overflow-x-auto">
                      {Object.entries(log.details).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-text-muted">{k}:</span>
                          <span className="text-text-primary font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
