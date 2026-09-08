import { useState, useEffect } from 'react'
import {
  Shield, Users, School, Bell, FileText, BarChart3,
  RefreshCw, CheckCircle2, ArrowLeft
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchAllUsers,
  subscribeAuthorizedTeachers,
  subscribeAnnouncements,
  subscribeAuditLogs,
} from '@/services/adminService'
import AnalyticsOverviewTab from '@/components/admin/AnalyticsOverviewTab'
import TeacherWhitelistTab from '@/components/admin/TeacherWhitelistTab'
import UserManagementTab from '@/components/admin/UserManagementTab'
import AnnouncementsTab from '@/components/admin/AnnouncementsTab'
import AuditLogsTab from '@/components/admin/AuditLogsTab'

const TABS = [
  { id: 'overview', label: 'Analytics & Overview', icon: BarChart3 },
  { id: 'teachers', label: 'Teacher Whitelist', icon: School },
  { id: 'users', label: 'User Moderation', icon: Users },
  { id: 'announcements', label: 'Broadcasts', icon: Bell },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
]

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview')

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const handleTabChange = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'overview' ? {} : { tab: id })
  }

  // Real-time and fetched state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  // Load users
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const list = await fetchAllUsers()
      setUsers(list)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Subscriptions
  useEffect(() => {
    const unsubTeachers = subscribeAuthorizedTeachers(setTeachers)
    const unsubAnnouncements = subscribeAnnouncements(setAnnouncements)
    const unsubAudit = subscribeAuditLogs(setAuditLogs)

    return () => {
      if (typeof unsubTeachers === 'function') unsubTeachers()
      if (typeof unsubAnnouncements === 'function') unsubAnnouncements()
      if (typeof unsubAudit === 'function') unsubAudit()
    }
  }, [])

  return (
    <div className="space-y-6 w-full max-w-full pb-16">
      {/* Simple Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Welcome back, {user?.displayName || 'Admin'}! 👋
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Admin Command Console
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loadingUsers}
          className="p-2.5 rounded-2xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle transition-all"
          title="Refresh All Records"
        >
          <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border-subtle/50 px-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/25 ring-1 ring-white/20'
                  : 'bg-surface/50 text-text-secondary hover:text-text-primary hover:bg-surface border border-border-subtle'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {id === 'teachers' && teachers.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-400'}`}>
                  {teachers.length}
                </span>
              )}
              {id === 'users' && users.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-accent/20 text-accent'}`}>
                  {users.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-200">
        {activeTab === 'overview' && (
          <AnalyticsOverviewTab
            users={users}
            teachers={teachers}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'teachers' && (
          <TeacherWhitelistTab
            adminUser={user}
            teachers={teachers}
            allUsers={users}
            onRefresh={loadUsers}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementTab
            adminUser={user}
            users={users}
            onRefresh={loadUsers}
            loadingUsers={loadingUsers}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            adminUser={user}
            announcements={announcements}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab
            auditLogs={auditLogs}
          />
        )}
      </div>
    </div>
  )
}
