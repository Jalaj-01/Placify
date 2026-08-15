import { useState, useEffect } from 'react'
import {
  BookOpen, CheckCircle2, Clock, Plus, Save, AlertTriangle,
  FileText, Sparkles, ChevronDown, ChevronRight, Trash2,
  TrendingUp, Award, Layers, CheckSquare, Square, Calendar
} from 'lucide-react'
import { subscribeSyllabus, saveSyllabusUnits } from '@/services/teacherService'
import { cn } from '@/lib/utils'

export default function TeacherSyllabusTracker({ course }) {
  const [syllabus, setSyllabus] = useState(null)
  const [units, setUnits] = useState([])
  const [pacingConfig, setPacingConfig] = useState({
    totalPlannedLectures: 40,
    totalDeliveredLectures: 0,
    targetStartDate: '',
    targetEndDate: ''
  })
  const [saving, setSaving] = useState(false)
  const [expandedUnit, setExpandedUnit] = useState(0)

  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeSyllabus(course.id, (data) => {
      if (data) {
        setSyllabus(data)
        setUnits(data.units || [])
        setPacingConfig({
          totalPlannedLectures: data.pacingMetrics?.totalPlannedLectures || 40,
          totalDeliveredLectures: data.pacingMetrics?.totalDeliveredLectures || 0,
          targetStartDate: data.pacingMetrics?.targetStartDate ? new Date(data.pacingMetrics.targetStartDate).toISOString().split('T')[0] : '',
          targetEndDate: data.pacingMetrics?.targetEndDate ? new Date(data.pacingMetrics.targetEndDate).toISOString().split('T')[0] : ''
        })
      } else {
        // Default template if brand new
        const initialUnits = [
          {
            unitNumber: 1,
            title: 'Unit 1: Foundations & Core Paradigms',
            description: 'Fundamental concepts, asymptotic analysis, and basic data models.',
            marksWeightage: 20,
            plannedTotalLectures: 8,
            learningOutcomes: ['Understand algorithm complexity', 'Design recurrent relations'],
            prerequisites: ['Basic Discrete Math'],
            chapters: [
              {
                title: 'Asymptotic Notations & Master Theorem',
                subTopics: [
                  { id: 'st_1', title: 'Big-O, Big-Theta, Big-Omega Analysis', plannedHours: 1.5, actualHours: 1.5, isCompleted: true, completedAt: new Date().toISOString() },
                  { id: 'st_2', title: 'Divide & Conquer Recurrences', plannedHours: 1.5, actualHours: 0, isCompleted: false, completedAt: null }
                ]
              }
            ]
          }
        ]
        setUnits(initialUnits)
      }
    })
    return unsub
  }, [course?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSyllabusUnits(course.id, units, pacingConfig)
    } catch (err) {
      alert('Error saving syllabus: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSubTopic = (unitIdx, chapIdx, subTopicIdx) => {
    const updated = [...units]
    const st = updated[unitIdx].chapters[chapIdx].subTopics[subTopicIdx]
    st.isCompleted = !st.isCompleted
    st.completedAt = st.isCompleted ? new Date().toISOString() : null
    setUnits(updated)
  }

  const handleAddUnit = () => {
    const newUnitNumber = units.length + 1
    const newUnit = {
      unitNumber: newUnitNumber,
      title: `Unit ${newUnitNumber}: Advanced Concepts`,
      description: 'Course unit outline and breakdown.',
      marksWeightage: 20,
      plannedTotalLectures: 8,
      learningOutcomes: [],
      prerequisites: [],
      chapters: [
        {
          title: 'Chapter 1: Theory & Application',
          subTopics: [
            { id: `st_${Date.now()}`, title: 'Introductory Concept', plannedHours: 1.0, actualHours: 0, isCompleted: false, completedAt: null }
          ]
        }
      ]
    }
    setUnits([...units, newUnit])
    setExpandedUnit(units.length)
  }

  const handleAddSubTopic = (unitIdx, chapIdx) => {
    const updated = [...units]
    updated[unitIdx].chapters[chapIdx].subTopics.push({
      id: `st_${Date.now()}`,
      title: 'New Sub-Topic',
      plannedHours: 1.0,
      actualHours: 0,
      isCompleted: false,
      completedAt: null
    })
    setUnits(updated)
  }

  const pacing = syllabus?.pacingMetrics || {
    overallCompletionPercentage: 0,
    pacingStatus: 'ON_TRACK',
    totalDeliveredLectures: 0,
    totalPlannedLectures: 40,
    deviationLectures: 0
  }

  return (
    <div className="space-y-5">
      {/* Course Division & Pacing Analytics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pacing Alert Card */}
        <div className={cn(
          "p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm",
          pacing.pacingStatus === 'BEHIND_SCHEDULE'
            ? "bg-semantic-red/10 border-semantic-red/30 text-semantic-red"
            : pacing.pacingStatus === 'AHEAD'
              ? "bg-semantic-green/10 border-semantic-green/30 text-semantic-green"
              : "bg-card border-border-subtle text-text-primary"
        )}>
          <div className="h-10 w-10 rounded-xl bg-surface flex items-center justify-center font-bold shrink-0">
            {pacing.pacingStatus === 'BEHIND_SCHEDULE' ? (
              <AlertTriangle className="h-5 w-5 text-semantic-red animate-pulse" />
            ) : (
              <TrendingUp className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-text-muted">Pacing Status</span>
            <span className="font-extrabold text-sm">{pacing.pacingStatus.replace('_', ' ')}</span>
            <span className="text-[10px] text-text-secondary block">
              {pacing.deviationLectures < 0
                ? `${Math.abs(pacing.deviationLectures)} classes behind expected`
                : pacing.deviationLectures > 0
                  ? `${pacing.deviationLectures} classes ahead of pace`
                  : 'Right on schedule'}
            </span>
          </div>
        </div>

        {/* Classes Logged vs Planned */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-text-muted">Delivered Classes</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-extrabold text-lg text-text-primary">{pacingConfig.totalDeliveredLectures}</span>
              <span className="text-xs text-text-muted font-bold">/ {pacingConfig.totalPlannedLectures} lectures</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPacingConfig(p => ({ ...p, totalDeliveredLectures: Math.max(0, p.totalDeliveredLectures - 1) }))}
              className="px-2 py-1 rounded bg-surface hover:bg-hover text-xs font-bold border border-border-subtle"
            >
              -
            </button>
            <button
              onClick={() => setPacingConfig(p => ({ ...p, totalDeliveredLectures: p.totalDeliveredLectures + 1 }))}
              className="px-2 py-1 rounded bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-sm"
            >
              +1 Log
            </button>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-text-muted">Syllabus Completion</span>
            <span className="font-mono font-bold text-accent">{pacing.overallCompletionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-300"
              style={{ width: `${pacing.overallCompletionPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted block">
            {pacing.completedSubTopicsCount} of {pacing.totalSubTopicsCount} sub-topics completed
          </span>
        </div>

        {/* Save Changes Button */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-text-muted font-bold uppercase">Save Progress</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Sync Syllabus Live'}</span>
          </button>
        </div>
      </div>

      {/* Units & Chapters Accordion Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            Academic Units & Structured Chapters ({units.length} Units)
          </h3>
          <button
            onClick={handleAddUnit}
            className="px-3 py-1.5 rounded-xl bg-surface hover:bg-hover border border-border-subtle text-xs font-bold text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-accent" />
            <span>Add Unit</span>
          </button>
        </div>

        <div className="space-y-3">
          {units.map((unit, uIdx) => {
            const isExp = expandedUnit === uIdx
            return (
              <div key={unit.unitNumber || uIdx} className="rounded-2xl border border-border-subtle bg-card overflow-hidden shadow-sm">
                {/* Unit Header */}
                <div
                  onClick={() => setExpandedUnit(isExp ? null : uIdx)}
                  className="p-4 bg-surface/60 hover:bg-surface flex items-center justify-between cursor-pointer transition-colors border-b border-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-accent/20 text-accent font-mono font-black text-xs flex items-center justify-center">
                      U{unit.unitNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{unit.title}</h4>
                      <p className="text-xs text-text-muted">
                        Weightage: <span className="font-bold text-accent">{unit.marksWeightage} marks</span> • {unit.plannedTotalLectures} Planned Classes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isExp ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
                  </div>
                </div>

                {/* Unit Content & Check-off list */}
                {isExp && (
                  <div className="p-4 space-y-4 text-xs bg-base/40">
                    <div className="space-y-1">
                      <label className="font-bold text-text-secondary block">Unit Title</label>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => {
                          const updated = [...units]
                          updated[uIdx].title = e.target.value
                          setUnits(updated)
                        }}
                        className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* Chapters List */}
                    <div className="space-y-3">
                      {(unit.chapters || []).map((chap, cIdx) => (
                        <div key={cIdx} className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-text-primary text-xs">{chap.title}</span>
                            <button
                              onClick={() => handleAddSubTopic(uIdx, cIdx)}
                              className="px-2 py-1 rounded-lg bg-card hover:bg-hover border border-border-subtle text-[11px] font-bold text-accent flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Sub-Topic
                            </button>
                          </div>

                          {/* Sub-Topics Interactive Check-off List */}
                          <div className="space-y-1.5">
                            {(chap.subTopics || []).map((st, sIdx) => (
                              <div
                                key={st.id || sIdx}
                                className={cn(
                                  "p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2",
                                  st.isCompleted
                                    ? "bg-semantic-green/10 border-semantic-green/30 text-text-primary"
                                    : "bg-card border-border-subtle text-text-secondary"
                                )}
                              >
                                <div className="flex items-center gap-2.5 flex-1">
                                  <button
                                    onClick={() => handleToggleSubTopic(uIdx, cIdx, sIdx)}
                                    className="text-text-muted hover:text-accent transition-colors"
                                  >
                                    {st.isCompleted ? (
                                      <CheckSquare className="h-4 w-4 text-semantic-green" />
                                    ) : (
                                      <Square className="h-4 w-4" />
                                    )}
                                  </button>
                                  <span className={cn("text-xs font-medium", st.isCompleted && "line-through text-text-muted")}>
                                    {st.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                                  <span>{st.plannedHours} hrs</span>
                                  {st.isCompleted && (
                                    <span className="px-1.5 py-0.2 rounded bg-semantic-green/20 text-semantic-green font-bold">
                                      Done
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
