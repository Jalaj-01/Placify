import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUSES = ['Wishlist', 'Applied', 'OA Scheduled', 'Interview Round', 'Offered', 'Rejected', 'Archived']

export default function QuickAddModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ companyName: '', role: '', status: 'Wishlist', jobLink: '', roundDate: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.companyName || !form.role) return
    setSaving(true)
    try {
      await onSave({
        companyName: form.companyName,
        role: form.role,
        status: form.status,
        jobLink: form.jobLink || '',
        roundDate: form.roundDate ? new Date(form.roundDate) : null,
        roundNotes: '',
        package: '',
      })
      setForm({ companyName: '', role: '', status: 'Wishlist', jobLink: '', roundDate: '' })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Company Name *" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <Input placeholder="Role *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Job Link (optional)" value={form.jobLink} onChange={(e) => setForm({ ...form, jobLink: e.target.value })} />
          <Input type="date" value={form.roundDate} onChange={(e) => setForm({ ...form, roundDate: e.target.value })} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.companyName || !form.role}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
