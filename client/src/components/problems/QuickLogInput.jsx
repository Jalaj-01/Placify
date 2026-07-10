import { useState } from 'react'
import { Link2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfidenceToggle } from './ConfidenceBadge'
import { parseUrl } from '@/services/aiService'
import { useAppStore } from '@/store/useAppStore'

export default function QuickLogInput({ onSave }) {
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confidence, setConfidence] = useState('Red')
  const [notes, setNotes] = useState('')
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
      })
      setUrl('')
      setPreview(null)
      setNotes('')
      setConfidence('Red')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Paste a LeetCode or GFG URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            className="pl-10"
            disabled={isOffline}
          />
        </div>
        <Button onClick={handleParse} disabled={parsing || !url.trim() || isOffline}>
          {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Parse'}
        </Button>
      </div>

      {error && <p className="text-secondary text-semantic-red">{error}</p>}

      {preview && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={preview.title}
                onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                className="flex-1 min-w-[200px]"
              />
              <Input
                value={preview.tag}
                onChange={(e) => setPreview({ ...preview, tag: e.target.value })}
                className="w-[140px]"
                placeholder="Tag"
              />
              <Badge variant="secondary">{preview.platform}</Badge>
              <Badge variant="outline">{preview.difficulty}</Badge>
            </div>

            <ConfidenceToggle value={confidence} onChange={setConfidence} />

            <Input
              placeholder="Optional note (one line)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button onClick={handleSave} disabled={saving || isOffline} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Problem'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
