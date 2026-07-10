import { useState, useEffect } from 'react'
import { PlaySquare, Youtube, Plus, Trash2, Save, Loader2, BookOpen, HelpCircle, Maximize2, Minimize2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCourses } from '@/hooks/useCourses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function Courses() {
  const { user } = useAuth()
  const { courses, loading, addCourse, deleteCourse, updateNotes } = useCourses(user?.uid)

  const [activeCourse, setActiveCourse] = useState(null)
  
  // Layout states
  const [listCollapsed, setListCollapsed] = useState(false)

  // Add course states
  const [showAdd, setShowAdd] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseUrl, setCourseUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  // Notes states
  const [localNotes, setLocalNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [isNotesDirty, setIsNotesDirty] = useState(false)

  // Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Set first course active on load if none selected
  useEffect(() => {
    if (courses.length > 0 && !activeCourse) {
      setActiveCourse(courses[0])
      setLocalNotes(courses[0].notes || '')
    }
  }, [courses, activeCourse])

  // Sync notes when switching active course
  const handleSelectCourse = (course) => {
    if (isNotesDirty && activeCourse) {
      updateNotes(activeCourse.id, localNotes)
    }
    setActiveCourse(course)
    setLocalNotes(course.notes || '')
    setIsNotesDirty(false)
  }

  const parseYoutubeUrl = (url) => {
    let embedId = ''
    let isPlaylist = false
    
    if (url.includes('list=')) {
      const match = url.match(/[?&]list=([^#\&\?]+)/)
      if (match) {
        embedId = match[1]
        isPlaylist = true
      }
    }
    
    if (!isPlaylist) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        embedId = match[2]
      }
    }
    
    return { embedId, isPlaylist }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    if (!courseName.trim() || !courseUrl.trim()) return
    setAdding(true)
    setError('')

    const { embedId, isPlaylist } = parseYoutubeUrl(courseUrl.trim())
    if (!embedId) {
      setError('Invalid YouTube link. Please paste a valid video URL or playlist link.')
      setAdding(false)
      return
    }

    try {
      const newId = await addCourse(courseName.trim(), courseUrl.trim(), embedId, isPlaylist)
      setCourseName('')
      setCourseUrl('')
      setShowAdd(false)
      
      const newCourseObj = { id: newId, name: courseName.trim(), url: courseUrl.trim(), embedId, isPlaylist, notes: '' }
      setActiveCourse(newCourseObj)
      setLocalNotes('')
      setIsNotesDirty(false)
    } catch (err) {
      setError('Failed to add course: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!activeCourse) return
    setNotesSaving(true)
    try {
      await updateNotes(activeCourse.id, localNotes)
      setIsNotesDirty(false)
    } catch (err) {
      console.error('Failed to save notes', err)
    } finally {
      setNotesSaving(false)
    }
  }

  const getEmbedUrl = (course) => {
    if (!course) return ''
    return course.isPlaylist
      ? `https://www.youtube.com/embed/videoseries?list=${course.embedId}`
      : `https://www.youtube.com/embed/${course.embedId}`
  }

  return (
    <div className="space-y-6">
      {/* Premium Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/50 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-semantic-red/10 border border-semantic-red/20 shadow-inner">
            <Youtube className="h-6 w-6 text-semantic-red animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary tracking-tight">Course Vault</h1>
            <p className="text-secondary text-text-secondary text-xs mt-0.5">Study YouTube lecture courses in an ad-free, distraction-free environment</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-xs font-semibold px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border-subtle max-w-xl mx-auto space-y-5 shadow-sm">
          <PlaySquare className="h-16 w-16 text-text-muted/65 mx-auto stroke-[1.25]" />
          <div className="space-y-2">
            <h3 className="text-body font-bold text-text-primary">No courses added yet</h3>
            <p className="text-secondary text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              Consolidate your coding playlists, system design bootcamps, or aptitude preparation videos here.
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="px-5">
            Add Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Course Selector Playlist Cards */}
          {!listCollapsed && (
            <div className="lg:col-span-1 space-y-3.5 animate-fade-in">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1 block">Your Playlists</span>
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1.5 scrollbar-thin">
                {courses.map((course) => {
                  const isActive = activeCourse?.id === course.id
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={cn(
                        "group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer relative transition-all duration-300 overflow-hidden",
                        isActive
                          ? "bg-accent/8 border-accent text-accent-light shadow-md shadow-accent/5"
                          : "bg-card border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary hover:bg-hover/30"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-md" />
                      )}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <PlaySquare className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                          isActive ? "text-accent-light" : "text-text-muted"
                        )} />
                        <div className="min-w-0">
                          <span className="text-xs font-bold truncate block leading-snug">{course.name}</span>
                          <span className="text-[9px] text-text-muted/80 block mt-0.5 font-medium uppercase tracking-wider">
                            {course.isPlaylist ? 'Playlist' : 'Single Video'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmId(course.id)
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-hover/60 transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Right Column: Premium Split-Pane Learning console */}
          {activeCourse && (
            <div className={cn("space-y-4", listCollapsed ? "lg:col-span-4" : "lg:col-span-3")}>
              
              {/* Workspace Header Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-surface p-2 rounded-xl border border-border-subtle/70">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setListCollapsed(!listCollapsed)}
                    className="h-8 text-xs flex items-center gap-1.5 bg-elevated border border-border hover:bg-hover text-text-primary transition-all font-semibold"
                  >
                    {listCollapsed ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                    {listCollapsed ? 'Show Course List' : 'Theater Mode'}
                  </Button>
                  <div className="h-4 w-[1px] bg-border-subtle" />
                  <span className="text-xs font-bold text-text-primary max-w-[200px] sm:max-w-xs truncate" title={activeCourse.name}>
                    {activeCourse.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                    activeCourse.isPlaylist ? "bg-accent/10 text-accent-light border border-accent/20" : "bg-semantic-purple-bg/30 text-semantic-purple border border-semantic-purple-bg"
                  )}>
                    {activeCourse.isPlaylist ? 'Playlist' : 'Lecture Video'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side split pane grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                {/* 65% width Video block */}
                <div className="xl:col-span-2 flex flex-col justify-center">
                  <div className="w-full aspect-video rounded-2xl border border-border-subtle bg-black overflow-hidden shadow-2xl relative">
                    <iframe
                      src={getEmbedUrl(activeCourse)}
                      title={activeCourse.name}
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* 35% width Notepad block (stretches to match video height) */}
                <div className="xl:col-span-1">
                  <Card className="border border-border-subtle bg-card h-full flex flex-col overflow-hidden shadow-md">
                    <CardHeader className="pb-3 border-b border-border-subtle/60 flex flex-row items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-accent-light" />
                        <CardTitle className="text-xs font-bold text-text-primary uppercase tracking-widest">
                          Lecture Notes
                        </CardTitle>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={notesSaving || !isNotesDirty}
                        className={cn(
                          "h-7 text-xs flex items-center gap-1 px-2.5 transition-all",
                          isNotesDirty ? "bg-accent hover:bg-accent-light text-white animate-pulse" : "bg-elevated border border-border"
                        )}
                      >
                        {notesSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        {isNotesDirty ? 'Save Notes *' : 'Saved'}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 flex-1 flex flex-col min-h-[250px]">
                      <textarea
                        value={localNotes}
                        onChange={(e) => {
                          setLocalNotes(e.target.value)
                          setIsNotesDirty(true)
                        }}
                        onBlur={handleSaveNotes}
                        className="w-full flex-1 bg-base text-text-primary text-xs font-sans p-3.5 outline-none resize-none rounded-xl border border-border-subtle focus:border-accent/40 leading-relaxed transition-all shadow-inner"
                        placeholder="📝 Type study notes, algorithms, SQL queries, or interview questions here. Auto-saves when clicking away."
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[480px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Add New Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Link any YouTube lecture or playlist to play it in a distraction-free window.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourse} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Course Name</label>
              <Input
                placeholder="e.g. Striver's A-Z DSA Playlist"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">YouTube Video or Playlist URL</label>
              <Input
                placeholder="https://www.youtube.com/playlist?list=..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete this course from your vault? Your saved notes for this course will be deleted as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmId) {
                  await deleteCourse(deleteConfirmId)
                  if (activeCourse?.id === deleteConfirmId) {
                    setActiveCourse(null)
                    setLocalNotes('')
                  }
                }
                setDeleteConfirmId(null)
              }}
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
