import { useState } from 'react'
import {
  FileSpreadsheet, Download, Search, Plus, Save, CheckCircle2,
  Filter, Award, Edit3, Trash2
} from 'lucide-react'

export default function GradebookVault() {
  const [students, setStudents] = useState([
    { id: '1', roll: '21CSE001', name: 'Aarav Sharma', section: 'Sec 3A', lab: 26, assignment: 18, midterm: 22, endterm: 23 },
    { id: '2', roll: '21CSE002', name: 'Ananya Verma', section: 'Sec 3A', lab: 29, assignment: 20, midterm: 24, endterm: 24 },
    { id: '3', roll: '21CSE003', name: 'Devendra Patel', section: 'Sec 3A', lab: 24, assignment: 16, midterm: 19, endterm: 20 },
    { id: '4', roll: '21CSE045', name: 'Ishita Gupta', section: 'Sec 3B', lab: 28, assignment: 19, midterm: 23, endterm: 22 },
    { id: '5', roll: '21CSE089', name: 'Rohan Mehta', section: 'Sec 3B', lab: 22, assignment: 15, midterm: 17, endterm: 18 }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState('All')
  const [editingId, setEditingId] = useState(null)

  const calcTotal = (s) => (Number(s.lab) || 0) + (Number(s.assignment) || 0) + (Number(s.midterm) || 0) + (Number(s.endterm) || 0)

  const calcGrade = (total) => {
    if (total >= 90) return 'O (Outstanding)'
    if (total >= 80) return 'A+ (Excellent)'
    if (total >= 70) return 'A (Very Good)'
    if (total >= 60) return 'B+ (Good)'
    if (total >= 50) return 'B (Above Avg)'
    return 'C (Re-Test)'
  }

  const handleMarkChange = (id, field, val) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: Number(val) || 0 } : s))
    )
  }

  // 1-Click CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Section', 'Lab Marks (30)', 'Assignment (20)', 'Mid-Term (25)', 'End-Term (25)', 'Total (100)', 'Grade']
    const rows = students.map((s) => {
      const total = calcTotal(s)
      const grade = calcGrade(total)
      return [s.roll, `"${s.name}"`, s.section, s.lab, s.assignment, s.midterm, s.endterm, total, `"${grade}"`]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `placify_gradebook_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSection = selectedSection === 'All' || s.section === selectedSection
    return matchesSearch && matchesSection
  })

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-semantic-purple" />
            Digital Gradebook Vault & Marks Registry
          </h3>
          <p className="text-xs text-text-muted">Batch mark entry for Labs, Assignments, Mid-Term, End-Term with 1-Click CSV Export.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md shadow-semantic-green/20 shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Gradebook CSV</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-base border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-semantic-purple"
          />
        </div>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-base border border-white/15 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
        >
          <option value="All">All Sections</option>
          <option value="Sec 3A">Sec 3A</option>
          <option value="Sec 3B">Sec 3B</option>
        </select>
      </div>

      {/* Gradebook Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface/80 text-text-muted border-b border-white/10 font-semibold">
              <th className="p-3">Roll No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Sec</th>
              <th className="p-3 text-center">Lab (/30)</th>
              <th className="p-3 text-center">Assign (/20)</th>
              <th className="p-3 text-center">Mid-Term (/25)</th>
              <th className="p-3 text-center">End-Term (/25)</th>
              <th className="p-3 text-center font-bold text-text-primary">Total (/100)</th>
              <th className="p-3 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.map((s) => {
              const total = calcTotal(s)
              const grade = calcGrade(total)
              return (
                <tr key={s.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3 font-mono text-text-muted">{s.roll}</td>
                  <td className="p-3 font-semibold text-text-primary">{s.name}</td>
                  <td className="p-3 text-text-muted">{s.section}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      max="30"
                      value={s.lab}
                      onChange={(e) => handleMarkChange(s.id, 'lab', e.target.value)}
                      className="w-12 bg-base border border-white/10 rounded px-1 py-0.5 text-center text-text-primary focus:border-semantic-purple"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      max="20"
                      value={s.assignment}
                      onChange={(e) => handleMarkChange(s.id, 'assignment', e.target.value)}
                      className="w-12 bg-base border border-white/10 rounded px-1 py-0.5 text-center text-text-primary focus:border-semantic-purple"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      max="25"
                      value={s.midterm}
                      onChange={(e) => handleMarkChange(s.id, 'midterm', e.target.value)}
                      className="w-12 bg-base border border-white/10 rounded px-1 py-0.5 text-center text-text-primary focus:border-semantic-purple"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      max="25"
                      value={s.endterm}
                      onChange={(e) => handleMarkChange(s.id, 'endterm', e.target.value)}
                      className="w-12 bg-base border border-white/10 rounded px-1 py-0.5 text-center text-text-primary focus:border-semantic-purple"
                    />
                  </td>
                  <td className="p-3 text-center font-bold text-semantic-purple">{total}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-semibold text-text-primary">
                      {grade}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
