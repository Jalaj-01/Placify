import { useState, useRef } from 'react'
import {
  Upload, FileText, Download, CheckCircle2, AlertTriangle,
  AlertCircle, X, RefreshCw, School, Users, FileUp
} from 'lucide-react'
import { bulkAddAuthorizedTeachers } from '@/services/adminService'

export default function BulkTeacherUploadModal({
  isOpen,
  onClose,
  adminUser,
  existingTeachers = [],
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'paste'
  const [rawText, setRawText] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [parsingError, setParsingError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultSummary, setResultSummary] = useState(null)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Existing emails set for quick pre-validation
  const existingSet = new Set(
    existingTeachers.map((t) => (t.email || '').toLowerCase().trim()).filter(Boolean)
  )

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const template = [
      'email,name,department,designation',
      'prof.sharma@iiitg.ac.in,Dr. Rajesh Sharma,Computer Science & Engineering,Associate Professor',
      'prof.ananya@iiitg.ac.in,Dr. Ananya Sen,Electronics & Communication Engineering,Professor',
      'hod.cse@iiitg.ac.in,Dr. HOD CSE,Computer Science & Engineering,Head of Department (HOD)',
      'tpo.cell@iiitg.ac.in,Mr. Vikram Nair,Career Development & Placements,Training & Placement Officer (TPO)',
      'faculty.ai@iiitg.ac.in,Dr. Priya Paul,Data Science & Artificial Intelligence,Assistant Professor',
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'placify_faculty_whitelist_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse raw text or CSV content
  const parseContent = (content) => {
    setParsingError('')
    setResultSummary(null)
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

    if (lines.length === 0) {
      setParsedRows([])
      return
    }

    const rows = []
    const seenEmails = new Set()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if header row
      if (i === 0 && line.toLowerCase().startsWith('email')) {
        continue
      }

      // Split by comma, tab, or semicolon
      let parts = []
      if (line.includes('\t')) {
        parts = line.split('\t')
      } else if (line.includes(';')) {
        parts = line.split(';')
      } else {
        // Simple comma split (handle simple quotes)
        parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim())
      }

      const email = (parts[0] || '').trim().toLowerCase()
      const name = (parts[1] || '').trim() || email.split('@')[0]
      const department = (parts[2] || '').trim() || 'Computer Science & Engineering'
      const designation = (parts[3] || '').trim() || 'Faculty Member'

      if (!email) continue

      let status = 'ready'
      let reason = 'Ready to authorize'

      if (!emailRegex.test(email)) {
        status = 'invalid'
        reason = 'Malformed email format'
      } else if (existingSet.has(email)) {
        status = 'duplicate'
        reason = 'Already in whitelist'
      } else if (seenEmails.has(email)) {
        status = 'duplicate'
        reason = 'Duplicate in list'
      } else {
        seenEmails.add(email)
      }

      rows.push({
        email,
        name,
        department,
        designation,
        status,
        reason,
      })
    }

    setParsedRows(rows)
  }

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result || ''
      parseContent(text)
    }
    reader.onerror = () => {
      setParsingError('Failed to read selected file.')
    }
    reader.readAsText(file)
  }

  // Paste text change handler
  const handlePasteChange = (text) => {
    setRawText(text)
    parseContent(text)
  }

  // Execute bulk import
  const handleExecuteImport = async () => {
    const readyToImport = parsedRows.filter((r) => r.status === 'ready')
    if (readyToImport.length === 0) return

    setIsProcessing(true)
    setParsingError('')
    try {
      const res = await bulkAddAuthorizedTeachers(adminUser, readyToImport)
      setResultSummary(res)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Bulk import error:', err)
      setParsingError(err.message || 'Bulk authorization failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const readyCount = parsedRows.filter((r) => r.status === 'ready').length
  const duplicateCount = parsedRows.filter((r) => r.status === 'duplicate').length
  const invalidCount = parsedRows.filter((r) => r.status === 'invalid').length

  const handleReset = () => {
    setParsedRows([])
    setRawText('')
    setFileName('')
    setResultSummary(null)
    setParsingError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-surface border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-border-subtle flex items-start justify-between gap-4 bg-surface/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold shrink-0 border border-purple-500/30">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-text-primary">Bulk Authorize Faculty Emails</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase">
                  Batch Whitelist
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Upload 10s or 100s of teacher emails at once. When faculty sign in with these emails, they receive the Teacher role automatically.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Result Confirmation View */}
          {resultSummary ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-300">
                  Batch Authorization Complete!
                </h4>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  Successfully authorized <strong>{resultSummary.addedCount}</strong> faculty email(s).
                  {resultSummary.skippedCount > 0 && ` ${resultSummary.skippedCount} entry/entries were skipped as duplicates or invalid.`}
                </p>
              </div>

              {resultSummary.skipped?.length > 0 && (
                <div className="text-left p-3 rounded-xl bg-surface/70 border border-border-subtle max-h-36 overflow-y-auto text-[11px] space-y-1">
                  <span className="font-bold text-text-muted block">Skipped Details:</span>
                  {resultSummary.skipped.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-text-secondary">
                      <span className="font-mono truncate">{s.email}</span>
                      <span className="text-amber-400 font-medium">{s.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-white/10 text-xs font-bold text-text-primary border border-border-subtle transition-all"
                >
                  Upload Another Batch
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white shadow-lg shadow-purple-600/20 transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Controls: Input mode toggle & Template Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex p-1 rounded-2xl bg-surface/90 border border-border-subtle text-xs">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'upload'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload CSV File</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'paste'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Paste Email List</span>
                  </button>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-xs font-bold text-text-secondary hover:text-text-primary border border-border-subtle transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  title="Download CSV format template"
                >
                  <Download className="h-3.5 w-3.5 text-purple-400" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              {/* Tab 1: File Dropzone */}
              {activeTab === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-3xl border-2 border-dashed border-border-subtle hover:border-purple-500/50 bg-surface/40 hover:bg-purple-500/5 transition-all cursor-pointer text-center space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FileUp className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">
                    {fileName ? fileName : 'Choose or drop CSV file here'}
                  </h4>
                  <p className="text-xs text-text-muted">
                    Supports .csv, .tsv, and .txt files (email, name, department, designation)
                  </p>
                </div>
              )}

              {/* Tab 2: Paste List Area */}
              {activeTab === 'paste' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Paste emails (one per line, or comma-separated CSV rows):</span>
                    <span>Example: prof@iiitg.ac.in, Dr. Sen, CSE, Professor</span>
                  </div>
                  <textarea
                    rows={5}
                    value={rawText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="prof.rajesh@iiitg.ac.in, Dr. Rajesh, CSE, Professor&#10;prof.ananya@iiitg.ac.in, Dr. Ananya, ECE, Associate Professor&#10;faculty.math@iiitg.ac.in"
                    className="w-full p-3.5 rounded-2xl bg-surface border border-border-subtle text-xs text-text-primary font-mono placeholder:text-text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              {/* Parsing Error */}
              {parsingError && (
                <div className="p-3 rounded-2xl bg-semantic-red/10 border border-semantic-red/30 text-semantic-red text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parsingError}</span>
                </div>
              )}

              {/* Live Validation Pill Counters */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-text-muted">
                      Pre-Upload Verification ({parsedRows.length} total)
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-bold">
                        {readyCount} ready
                      </span>
                      {duplicateCount > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 font-mono text-[11px] font-bold">
                          {duplicateCount} duplicate
                        </span>
                      )}
                      {invalidCount > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-semantic-red/15 text-semantic-red font-mono text-[11px] font-bold">
                          {invalidCount} invalid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="rounded-2xl border border-border-subtle bg-surface/60 overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-surface border-b border-border-subtle text-[10px] uppercase font-bold text-text-muted">
                        <tr>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">Designation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50 text-[11px]">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 whitespace-nowrap">
                              {row.status === 'ready' && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                                  Ready
                                </span>
                              )}
                              {row.status === 'duplicate' && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                  Skipped ({row.reason})
                                </span>
                              )}
                              {row.status === 'invalid' && (
                                <span className="px-2 py-0.5 rounded-md bg-semantic-red/20 text-semantic-red font-bold text-[10px]">
                                  Invalid
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-text-primary font-medium">{row.email}</td>
                            <td className="p-2.5 text-text-secondary">{row.name}</td>
                            <td className="p-2.5 text-text-muted">{row.department}</td>
                            <td className="p-2.5 text-text-muted">{row.designation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!resultSummary && (
          <div className="p-4 border-t border-border-subtle bg-surface/90 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-white/10 text-xs font-bold text-text-secondary hover:text-text-primary transition-all border border-border-subtle"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {parsedRows.length > 0 && (
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing || readyCount === 0}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-black text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Authorizing {readyCount} Teachers...</span>
                  </>
                ) : (
                  <>
                    <School className="h-4 w-4" />
                    <span>Authorize {readyCount} Faculty Accounts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
