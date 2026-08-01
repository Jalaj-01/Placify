import { useState } from 'react'
import {
  FolderGit2, DollarSign, Plus, CheckCircle2, Clock, Send, FileText, TrendingUp
} from 'lucide-react'

export default function GrantExpenseTracker() {
  const [grants, setGrants] = useState([
    { id: '1', name: 'SERB Core Research Grant (CRG-2026)', allocated: 3500000, spent: 1420000 },
    { id: '2', name: 'DST-FIST Research Scholar Travel Fellowship', allocated: 150000, spent: 85000 }
  ])

  const [claims, setClaims] = useState([
    { id: '1', date: 'Jul 15, 2026', grant: 'DST-FIST Travel', description: 'IEEE TPDS Conference Registration Fee', amount: 45000, status: 'Reimbursed' },
    { id: '2', date: 'Jul 28, 2026', grant: 'SERB CRG-2026', description: 'AWS Cloud GPU Training Compute Credits', amount: 32000, status: 'Under Verification' }
  ])

  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimForm, setClaimForm] = useState({
    grant: 'SERB CRG-2026',
    description: '',
    amount: 15000
  })

  const handleAddClaim = (e) => {
    e.preventDefault()
    if (!claimForm.description.trim()) return
    const newClaim = {
      ...claimForm,
      id: String(Date.now()),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Under Verification'
    }
    setClaims((prev) => [newClaim, ...prev])
    setShowClaimModal(false)
  }

  const formatINR = (val) => '₹' + Number(val).toLocaleString('en-IN')

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-semantic-green" />
            Research Grants & Expense Disbursal Tracker
          </h3>
          <p className="text-xs text-text-muted">Track allocated research grant balances and log travel & conference reimbursement claims.</p>
        </div>

        <button
          onClick={() => setShowClaimModal(true)}
          className="px-4 py-2 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md shadow-semantic-green/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log Reimbursement Claim</span>
        </button>
      </div>

      {/* Grant Budget Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grants.map((g) => {
          const balance = g.allocated - g.spent
          const pctSpent = Math.round((g.spent / g.allocated) * 100)
          return (
            <div key={g.id} className="p-5 rounded-xl bg-base/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary text-xs truncate max-w-[240px]">{g.name}</h4>
                <span className="text-[10px] text-semantic-green font-mono font-bold bg-semantic-green/10 px-2 py-0.5 rounded">
                  {pctSpent}% Spent
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Spent: {formatINR(g.spent)}</span>
                  <span className="text-semantic-green font-bold">Balance: {formatINR(balance)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-base overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-semantic-green to-emerald-400 transition-all duration-500"
                    style={{ width: `${pctSpent}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-muted text-right">Total Allocated: {formatINR(g.allocated)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reimbursement Claims Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" /> Reimbursement & Expense Claim Log
        </h4>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface/80 text-text-muted border-b border-white/10 font-semibold">
                <th className="p-3">Claim Date</th>
                <th className="p-3">Grant Bucket</th>
                <th className="p-3">Expense Description</th>
                <th className="p-3 text-center">Claim Amount</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3 font-mono text-text-muted">{c.date}</td>
                  <td className="p-3 font-semibold text-text-primary">{c.grant}</td>
                  <td className="p-3 text-text-secondary">{c.description}</td>
                  <td className="p-3 text-center font-bold text-semantic-green">{formatINR(c.amount)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'Reimbursed'
                          ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                          : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-text-primary text-base">Log Research Reimbursement Claim</h4>
              <button onClick={() => setShowClaimModal(false)} className="text-text-muted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddClaim} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Select Grant Funding Bucket</label>
                <select
                  value={claimForm.grant}
                  onChange={(e) => setClaimForm({ ...claimForm, grant: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                >
                  <option value="SERB CRG-2026">SERB Core Research Grant (CRG-2026)</option>
                  <option value="DST-FIST Travel">DST-FIST Travel Fellowship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM Conference Registration Fee or AWS GPU Credits"
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Claim Amount (₹)</label>
                <input
                  type="number"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: Number(e.target.value) })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Reimbursement Claim</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
