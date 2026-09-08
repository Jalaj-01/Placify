import { useState, useEffect } from 'react'
import { Shield, GraduationCap, School, BookOpenCheck, Eye } from 'lucide-react'

const SIMULATION_ROLES = [
  { id: 'admin', label: 'Admin Master', icon: Shield, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'teacher', label: 'Teacher View', icon: School, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'student', label: 'Student View', icon: GraduationCap, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { id: 'phd', label: 'PhD Scholar', icon: BookOpenCheck, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
]

export default function RoleSimulatorCapsule({ compact = false }) {
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('placify_active_role') || 'admin')

  useEffect(() => {
    const handleRoleChange = () => {
      setActiveRole(localStorage.getItem('placify_active_role') || 'admin')
    }
    window.addEventListener('placify-role-change', handleRoleChange)
    return () => window.removeEventListener('placify-role-change', handleRoleChange)
  }, [])

  const handleSelect = (roleId) => {
    setActiveRole(roleId)
    localStorage.setItem('placify_active_role', roleId)
    window.dispatchEvent(new Event('placify-role-change'))
  }

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-text-muted">
        <Eye className="h-3.5 w-3.5 text-accent" />
        <span className="hidden sm:inline">Simulate Role:</span>
      </div>

      <div className="flex items-center gap-1">
        {SIMULATION_ROLES.map(({ id, label, icon: Icon, color }) => {
          const isCurrent = activeRole === id
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                isCurrent
                  ? `${color} shadow-sm ring-1 ring-white/20 scale-[1.02]`
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
              title={`Preview as ${label}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {!compact && <span className="hidden md:inline">{label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
