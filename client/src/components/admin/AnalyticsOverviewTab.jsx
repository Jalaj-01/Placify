import { Users, School, GraduationCap, ShieldAlert, Code2, Flame, Shield, ArrowUpRight } from 'lucide-react'

export default function AnalyticsOverviewTab({ users = [], teachers = [], onSelectTab }) {
  const totalUsers = users.length
  const totalStudents = users.filter((u) => (u.role || 'student').toLowerCase() === 'student').length
  const totalTeachers = users.filter((u) => ['teacher', 'faculty'].includes((u.role || '').toLowerCase())).length
  const totalPhd = users.filter((u) => ['phd', 'research'].includes((u.role || '').toLowerCase())).length
  const totalAdmins = users.filter((u) => (u.role || '').toLowerCase() === 'admin').length
  const totalBlocked = users.filter((u) => u.isBlocked).length

  const totalProblemsSolved = users.reduce((acc, u) => acc + (u.totalSolved || 0), 0)
  const totalStreaksActive = users.filter((u) => (u.currentStreak || 0) > 0).length

  const studentPct = totalUsers > 0 ? Math.round((totalStudents / totalUsers) * 100) : 0
  const teacherPct = totalUsers > 0 ? Math.round((totalTeachers / totalUsers) * 100) : 0
  const phdPct = totalUsers > 0 ? Math.round((totalPhd / totalUsers) * 100) : 0

  const kpis = [
    {
      title: 'Total Users',
      value: totalUsers,
      subtext: 'Registered accounts',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    },
    {
      title: 'Active Students',
      value: totalStudents,
      subtext: `${studentPct}% of community`,
      icon: GraduationCap,
      color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    },
    {
      title: 'Verified Teachers',
      value: totalTeachers,
      subtext: `${teachers.length} pre-authorized`,
      icon: School,
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    },
    {
      title: 'Suspended Accounts',
      value: totalBlocked,
      subtext: totalBlocked > 0 ? 'Action required' : 'Platform healthy',
      icon: ShieldAlert,
      color: totalBlocked > 0 ? 'text-semantic-red bg-semantic-red/15 border-semantic-red/30' : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    },
    {
      title: 'Total Solved Log',
      value: totalProblemsSolved,
      subtext: 'Across all cohorts',
      icon: Code2,
      color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    },
    {
      title: 'Active Daily Streaks',
      value: totalStreaksActive,
      subtext: 'Students practicing today',
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-7 rounded-3xl bg-gradient-to-br from-surface/90 via-surface/60 to-purple-900/10 border border-border-subtle backdrop-blur-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Master Administrative Authority</span>
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Placify Command & Control Center
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Real-time platform metrics, institutional role governance, faculty pre-authorization, and cohort monitoring.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => onSelectTab('teachers')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
          >
            <span>Authorize Teacher</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onSelectTab('users')}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-white/10 text-text-primary text-xs font-bold transition-all border border-border-subtle flex items-center gap-1.5"
          >
            <span>Manage Users</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onSelectTab('announcements')}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-white/10 text-text-primary text-xs font-bold transition-all border border-border-subtle flex items-center gap-1.5"
          >
            <span>Broadcast Alert</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(({ title, value, subtext, icon: Icon, color }) => (
          <div
            key={title}
            className="p-5 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl hover:border-white/20 transition-all flex items-center gap-4 shadow-lg group"
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${color} shrink-0 group-hover:scale-105 transition-transform`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted">{title}</p>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">{value}</h3>
              <p className="text-[11px] text-text-secondary mt-0.5">{subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role Composition Bar */}
      <div className="p-6 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-text-primary">Institutional Role Breakdown</h3>
          <span className="text-xs text-text-muted">{totalUsers} Registered Total</span>
        </div>

        {/* Visual progress bar */}
        <div className="h-4 w-full rounded-full bg-base overflow-hidden flex border border-border-subtle">
          <div style={{ width: `${studentPct}%` }} className="bg-cyan-500 h-full transition-all" title={`Students: ${studentPct}%`} />
          <div style={{ width: `${teacherPct}%` }} className="bg-purple-500 h-full transition-all" title={`Teachers: ${teacherPct}%`} />
          <div style={{ width: `${phdPct}%` }} className="bg-emerald-500 h-full transition-all" title={`PhD: ${phdPct}%`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-cyan-500 shrink-0" />
            <div>
              <p className="font-bold text-text-primary">Students</p>
              <p className="text-[11px] text-text-muted">{totalStudents} ({studentPct}%)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-purple-500 shrink-0" />
            <div>
              <p className="font-bold text-text-primary">Teachers</p>
              <p className="text-[11px] text-text-muted">{totalTeachers} ({teacherPct}%)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-text-primary">PhD Scholars</p>
              <p className="text-[11px] text-text-muted">{totalPhd} ({phdPct}%)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-text-primary">Super Admins</p>
              <p className="text-[11px] text-text-muted">{totalAdmins}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
