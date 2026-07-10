import { Code2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import QuickLogInput from '@/components/problems/QuickLogInput'
import ProblemList from '@/components/problems/ProblemList'
import CompanyKits from '@/components/problems/CompanyKits'

export default function Problems() {
  const { user } = useAuth()
  const { problems, loading, addProblem, updateProblem, deleteProblem, importCompanyKit } = useProblems(user?.uid)

  const handleAdd = async (data) => {
    await addProblem(data)
  }

  const handleUpdate = async (id, data) => {
    await updateProblem(id, data)
  }

  const handleDelete = async (id) => {
    await deleteProblem(id)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <Code2 className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">Problem Log</h1>
          <p className="text-secondary text-text-secondary">Keep track of your coding and algorithm problem status</p>
        </div>
      </div>

      {/* Quick Log Input Section */}
      <div className="bg-surface rounded-card border border-border-subtle p-4">
        <h2 className="text-card-title font-semibold mb-3">Quick Log</h2>
        <QuickLogInput onSave={handleAdd} />
      </div>

      {/* Company Prep Kits Import Section */}
      <div className="bg-surface rounded-card border border-border-subtle p-4">
        <CompanyKits onImport={importCompanyKit} />
      </div>

      {/* Problems List Section */}
      <div className="space-y-4">
        <h2 className="text-section font-semibold text-text-primary">All Logged Problems</h2>
        <ProblemList
          problems={problems}
          loading={loading}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
