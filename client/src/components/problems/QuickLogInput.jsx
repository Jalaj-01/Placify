import { useState } from 'react'
import { Link2, Loader2, FileUp, Paperclip, ClipboardList, Trash2 } from 'lucide-react'
import { storage } from '@/config/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfidenceToggle } from './ConfidenceBadge'
import { parseUrl } from '@/services/aiService'
import { useAppStore } from '@/store/useAppStore'

export default function QuickLogInput({ onSave, user }) {
  const [mode, setMode] = useState('single') // 'single' or 'bulk'
  const [problemType, setProblemType] = useState('DSA') // 'DSA' or 'Aptitude'

  // Single mode states
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confidence, setConfidence] = useState('Red')
  const [notes, setNotes] = useState('')
  const [attachments, setAttachments] = useState([])
  const [fileUploading, setFileUploading] = useState(false)

  // Bulk mode states
  const [bulkUrls, setBulkUrls] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)

  const [error, setError] = useState('')
  const { isOffline } = useAppStore()

  const handleParse = async () => {
    if (!url.trim() || isOffline) return
    setParsing(true)
    setError('')
    try {
      const result = await parseUrl(url.trim())
      setPreview({ ...result, title: result.title })
    } catch (e) {
      setError(e.message)
    } finally {
      setParsing(false)
    }
  }

  const handleManualAdd = () => {
    setPreview({
      title: 'Custom Problem',
      url: '',
      platform: 'Other',
      tag: 'General',
      difficulty: 'Medium',
    })
    setError('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || isOffline) return
    setFileUploading(true)
    setError('')
    try {
      const path = `users/${user?.uid || 'anonymous'}/problems/attachments/${Date.now()}_${file.name}`
      const sRef = storageRef(storage, path)
      const snapshot = await uploadBytes(sRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)

      setAttachments((prev) => [
        ...prev,
        { name: file.name, url: downloadUrl, type: file.type },
      ])
    } catch (err) {
      setError('File upload failed: ' + err.message)
    } finally {
      setFileUploading(false)
    }
  }

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!preview || isOffline) return
    setSaving(true)
    try {
      await onSave({
        title: preview.title,
        url: preview.url || url,
        platform: preview.platform,
        tag: preview.tag,
        difficulty: preview.difficulty,
        confidenceStatus: confidence,
        notes: notes.trim(),
        problemType,
        attachments,
      })
      setUrl('')
      setPreview(null)
      setNotes('')
      setConfidence('Red')
      setAttachments([])
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkImport = async () => {
    const lines = bulkUrls
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0 || isOffline) return

    setBulkImporting(true)
    setError('')
    try {
      let successCount = 0
      for (const line of lines) {
        const isUrl = line.startsWith('http://') || line.startsWith('https://')
        if (isUrl) {
          try {
            const parsed = await parseUrl(line)
            await onSave({
              title: parsed.title,
              url: parsed.url || line,
              platform: parsed.platform,
              tag: parsed.tag,
              difficulty: parsed.difficulty,
              confidenceStatus: 'Red',
              notes: 'Bulk imported link',
              problemType,
              attachments: [],
            })
            successCount++
          } catch {
            let title = 'Custom Problem'
            let platform = 'Other'
            try {
              const urlObj = new URL(line)
              const slug = urlObj.pathname.split('/').filter(Boolean).pop() || 'Problem'
              title = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              platform = line.includes('leetcode') ? 'LeetCode' : line.includes('geeksforgeeks') ? 'GeeksforGeeks' : 'Other'
            } catch {}
            await onSave({
              title,
              url: line,
              platform,
              tag: 'General',
              difficulty: 'Medium',
              confidenceStatus: 'Red',
              notes: 'Bulk imported link (unparsed)',
              problemType,
              attachments: [],
            })
            successCount++
          }
        } else {
          // Direct text question title!
          await onSave({
            title: line,
            url: '',
            platform: 'Other',
            tag: 'General',
            difficulty: 'Medium',
            confidenceStatus: 'Red',
            notes: 'Bulk manual entry',
            problemType,
            attachments: [],
          })
          successCount++
        }
      }
      setBulkUrls('')
      setPreview(null)
      setError(`Successfully imported ${successCount} questions in bulk!`)
    } catch (e) {
      setError('Bulk import failed: ' + e.message)
    } finally {
      setBulkImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode & Category Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-2 rounded-lg border border-border-subtle">
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={mode === 'single' ? 'default' : 'ghost'}
            onClick={() => { setMode('single'); setError(''); }}
          >
            Single Entry
          </Button>
          <Button
            size="sm"
            variant={mode === 'bulk' ? 'default' : 'ghost'}
            onClick={() => { setMode('bulk'); setError(''); }}
          >
            Bulk Upload
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-micro text-text-secondary uppercase">Problem Category:</span>
          <div className="flex gap-1 bg-card rounded-md border border-border-subtle p-0.5">
            <button
              onClick={() => setProblemType('DSA')}
              className={`text-micro px-2.5 py-1 rounded transition-colors ${
                problemType === 'DSA' ? 'bg-accent text-white font-medium' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              DSA
            </button>
            <button
              onClick={() => setProblemType('Aptitude')}
              className={`text-micro px-2.5 py-1 rounded transition-colors ${
                problemType === 'Aptitude' ? 'bg-semantic-green text-white font-medium' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Aptitude
            </button>
          </div>
        </div>
      </div>

      {mode === 'single' ? (
        /* Single URL Log */
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Paste a LeetCode/GFG URL, or click Add Manually..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              className="pl-10"
              disabled={isOffline}
            />
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button onClick={handleParse} disabled={parsing || !url.trim() || isOffline}>
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Parse'}
            </Button>
            <Button variant="outline" onClick={handleManualAdd} className="bg-elevated border border-border text-text-primary hover:bg-hover">
              + Add Manually
            </Button>
          </div>
        </div>
      ) : (
        /* Bulk URL & Title log */
        <div className="space-y-3">
          <textarea
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            placeholder="Paste multiple URLs or raw question titles here (one item per line)..."
            className="w-full h-32 bg-card border border-border-subtle rounded-md p-3 text-body outline-none focus:border-border-hover resize-none"
            disabled={isOffline || bulkImporting}
          />
          <Button
            onClick={handleBulkImport}
            disabled={bulkImporting || !bulkUrls.trim() || isOffline}
            className="w-full flex items-center justify-center gap-1.5"
          >
            {bulkImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing Questions...
              </>
            ) : (
              <>
                <ClipboardList className="h-4 w-4" />
                Bulk Import Questions
              </>
            )}
          </Button>
        </div>
      )}

      {error && <p className="text-secondary text-accent-light text-xs">{error}</p>}

      {/* Single Mode Preview Card */}
      {mode === 'single' && preview && (
        <Card className="animate-fade-in">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={preview.title}
                onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                className="flex-1 min-w-[200px]"
                placeholder="Question Name"
              />
              <Input
                value={preview.tag}
                onChange={(e) => setPreview({ ...preview, tag: e.target.value })}
                className="w-[120px]"
                placeholder="Tag (e.g. Arrays)"
              />
              
              <select
                value={preview.platform}
                onChange={(e) => setPreview({ ...preview, platform: e.target.value })}
                className="bg-surface border border-border-subtle rounded-md text-xs px-2.5 py-1.5 outline-none text-text-primary h-10 shrink-0 font-medium"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={preview.difficulty}
                onChange={(e) => setPreview({ ...preview, difficulty: e.target.value })}
                className="bg-surface border border-border-subtle rounded-md text-xs px-2.5 py-1.5 outline-none text-text-primary h-10 shrink-0 font-medium"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <ConfidenceToggle value={confidence} onChange={setConfidence} />

            <Input
              placeholder="Optional notes or solution reminders"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* File upload block */}
            <div className="border-t border-border-subtle pt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-micro text-text-secondary font-medium">Attach Note / Solution (Image or PDF)</label>
                {fileUploading && <Loader2 className="h-4.5 w-4.5 text-accent-light animate-spin shrink-0" />}
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 cursor-pointer bg-surface px-3 py-1.5 rounded border border-border-subtle hover:border-border-hover text-micro text-text-secondary transition-colors">
                  <FileUp className="h-4 w-4 text-text-muted" /> Select File
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={fileUploading || isOffline}
                  />
                </label>
                <div className="flex-1 flex gap-2 flex-wrap">
                  {attachments.map((att, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-micro bg-hover px-2 py-0.5 rounded text-accent-light border border-border-subtle">
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="max-w-[120px] truncate">{att.name}</span>
                      <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-text-muted hover:text-semantic-red p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving || fileUploading || isOffline} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Problem'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
