import { useAuth } from '@/hooks/useAuth'
import StudentClassroomVault from '@/components/student/StudentClassroomVault'

export default function ClassroomVault() {
  const { user, profile } = useAuth()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StudentClassroomVault user={user} profile={profile} />
    </div>
  )
}
