import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Bell, BriefcaseBusiness, CheckSquare, Code2, Plus, Search, Sparkles, StickyNote, ArrowRight, Pin, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useStickyNotes } from '@/hooks/useStickyNotes'
import { useAuth } from '@/hooks/useAuth'
import { htmlToCleanText } from '@/utils/textHelpers'
import './StudentDashboard.css'

function dateKey(value) {
  if (!value) return null
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function ProgressGauge({ count }) {
  return <div className="refresh-gauge" role="img" aria-label={`${count} problems logged`}>
    <svg viewBox="0 0 160 140" aria-hidden="true"><path className="refresh-gauge__track" d="M 28 112 A 64 64 0 1 1 132 112" /><circle className="refresh-gauge__marker" cx="28" cy="112" r="4" /></svg>
    <div className="refresh-gauge__label"><span>Logged</span><strong>{count}</strong><small>Problems</small></div>
  </div>
}

function ActivityCalendar({ streakData }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthStart = new Date(year, month, 1)
  const offset = monthStart.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const activeDays = new Set((Array.isArray(streakData?.activityLog) ? streakData.activityLog : []).map(dateKey).filter(Boolean))
  const monthName = today.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  return <section className="refresh-card refresh-calendar" aria-label="Daily active streak calendar">
    <div className="refresh-calendar__heading"><div><h2>Daily active streak</h2><p>{monthName} · {streakData?.currentStreak || 0} day streak</p></div><span>This month</span></div>
    <div className="refresh-calendar__grid" role="grid" aria-label={monthName}>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span className="refresh-calendar__weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>)}
      {Array.from({ length: offset }, (_, index) => <span className="refresh-calendar__blank" role="gridcell" key={`blank-${index}`} />)}
      {Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1
        const key = dateKey(new Date(year, month, day))
        const active = activeDays.has(key)
        return <span className={`refresh-calendar__day${active ? ' has-activity' : ''}${day === today.getDate() ? ' is-today' : ''}`} role="gridcell" aria-label={`${monthName.split(' ')[0]} ${day}${active ? ', active day' : ''}`} key={key}>{day}{active && <i aria-hidden="true" />}</span>
      })}
    </div>
    <p className="refresh-calendar__legend"><i /> Active day</p>
  </section>
}

function NotePanel() {
  const { user } = useAuth()
  const { notes = [], addNote } = useStickyNotes(user?.uid)
  const openStickyNotes = useAppStore((state) => state.openStickyNotes)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const pinned = notes.filter((note) => note.isPinned).length

  const save = async (event) => {
    event.preventDefault()
    const content = htmlToCleanText(draft).trim()
    if (!content || saving) return
    setSaving(true)
    try {
      await addNote({ title: content.split('\n')[0].slice(0, 60) || 'Quick Note', content, color: 'yellow', isPinned: false })
      setDraft('')
      setCreating(false)
    } finally {
      setSaving(false)
    }
  }

  return <section className="refresh-card refresh-notes" aria-labelledby="refresh-notes-title">
    <div className="refresh-notes__heading"><span><StickyNote size={17} /></span><h2 id="refresh-notes-title">Sticky notes</h2><button type="button" onClick={() => setCreating((value) => !value)} aria-label={creating ? 'Cancel new note' : 'Add a note'}>{creating ? <X size={18} /> : <Plus size={20} />}</button></div>
    {creating ? <form className="refresh-notes__form" onSubmit={save}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a quick note..." aria-label="New sticky note" autoFocus /><div><button type="button" onClick={() => { setCreating(false); setDraft('') }}>Cancel</button><button type="submit" disabled={!draft.trim() || saving}>{saving ? 'Saving…' : 'Save note'}</button></div></form> : notes.length === 0 ? <button className="refresh-notes__empty" type="button" onClick={() => setCreating(true)}><Plus size={17} />Create your first note</button> : <div className="refresh-notes__list">{notes.slice(0, 2).map((note) => <button className="refresh-notes__note" type="button" key={note.id} onClick={openStickyNotes}><strong>{note.title || 'Quick Note'}{note.isPinned && <Pin size={12} />}</strong><span>{htmlToCleanText(note.content || '')}</span></button>)}</div>}
    <div className="refresh-notes__footer"><span>{notes.length} total · {pinned} pinned</span><button type="button" onClick={openStickyNotes}>Open all <ArrowRight size={14} /></button></div>
  </section>
}

function CompetencyMap({ topics }) {
  const axes = ['DSA', 'OS', 'DBMS', 'CN', 'OOPS', 'Aptitude']
  const values = axes.map((subject) => {
    const matching = topics.filter((topic) => subject === 'Aptitude' ? String(topic?.subject || '').startsWith('Aptitude') : topic?.subject === subject)
    return matching.length ? Math.round(matching.filter((topic) => topic.status === 'Done').length / matching.length * 100) : 0
  })
  const points = values.map((value, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3
    const radius = 20 + value * 0.78
    return `${200 + Math.cos(angle) * radius},${150 + Math.sin(angle) * radius}`
  }).join(' ')
  return <section className="refresh-card refresh-competency" aria-labelledby="refresh-competency-title">
    <h2 id="refresh-competency-title">Competency Map</h2>
    <div className="refresh-competency__inner"><div className="refresh-competency__heading"><Award size={19} /><h3>Competency Index</h3></div>
      <svg className="refresh-competency__chart" viewBox="0 0 400 300" role="img" aria-label={`Topic mastery: ${axes.map((axis, index) => `${axis} ${values[index]} percent`).join(', ')}`}>
        <g className="refresh-competency__web"><polygon points="200,35 300,92.5 300,207.5 200,265 100,207.5 100,92.5" /><polygon points="200,63.75 275,106.9 275,193.1 200,236.25 125,193.1 125,106.9" /><polygon points="200,92.5 250,121.25 250,178.75 200,207.5 150,178.75 150,121.25" /><polygon points="200,121.25 225,135.6 225,164.4 200,178.75 175,164.4 175,135.6" /><path d="M200 150V35 M200 150L300 92.5 M200 150L300 207.5 M200 150V265 M200 150L100 207.5 M200 150L100 92.5" /></g>
        <polygon className="refresh-competency__score" points={points} />
        <g className="refresh-competency__labels"><text x="200" y="20" textAnchor="middle">DSA</text><text x="311" y="89">OS</text><text x="311" y="216">DBMS</text><text x="200" y="286" textAnchor="middle">CN</text><text x="89" y="216" textAnchor="end">OOPS</text><text x="89" y="89" textAnchor="end">Aptitude</text></g>
      </svg>
    </div>
  </section>
}

export default function StudentDashboard({ user, profile, problems = [], topics = [], applications = [], streakData = {} }) {
  const openAICoach = useAppStore((state) => state.openAICoach)
  const toggleInvitesDrawer = useAppStore((state) => state.toggleInvitesDrawer)
  const navigate = useNavigate()
  const safeProblems = Array.isArray(problems) ? problems : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeApplications = Array.isArray(applications) ? applications : []
  const completedTopics = safeTopics.filter((topic) => topic?.status === 'Done').length
  const activeApplications = safeApplications.filter((app) => app && !['Offered', 'Rejected', 'Archived'].includes(app.status)).length
  const userName = profile?.displayName || user?.displayName || 'there'

  return <div className="placify-dashboard-refresh">
    <header className="refresh-heading"><div><p>Welcome</p><h1>{userName}</h1></div><div className="refresh-heading__actions"><button type="button" aria-label="Open problem search" title="Open Problem Log" onClick={() => navigate('/problems')}><Search size={19} /></button><button type="button" aria-label="Open notifications" title="Invites and notifications" onClick={toggleInvitesDrawer}><Bell size={19} /><i /></button></div></header>
    <div className="refresh-overview">
      <section className="refresh-card refresh-summary" aria-label="Your activity at a glance">
        <article className="refresh-problems"><div className="refresh-problems__heading"><div><p>Your activity at a glance</p><h2>Problems logged</h2></div><Code2 size={20} /></div><ProgressGauge count={safeProblems.length} /></article>
        <div className="refresh-metrics">
          <article className="refresh-metric refresh-metric--topics"><div><span><CheckSquare size={18} /></span><p>Topics mastered</p></div><strong>{completedTopics}<small> / {safeTopics.length}</small></strong><p className="refresh-metric__note">Auto-computed subject mastery</p></article>
          <article className="refresh-metric refresh-metric--jobs"><div><span><BriefcaseBusiness size={18} /></span><p>Active job drives</p></div><strong>{activeApplications}</strong><p className="refresh-metric__note">In wishlist, interview or QA stages</p></article>
        </div>
      </section>
      <ActivityCalendar streakData={streakData} />
    </div>
    <div className="refresh-lower-grid"><NotePanel /><CompetencyMap topics={safeTopics} /></div>
    <button className="refresh-ai-coach" type="button" onClick={openAICoach}><Sparkles size={17} /><span>AI Coach</span></button>
  </div>
}
