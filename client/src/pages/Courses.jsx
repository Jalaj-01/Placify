import { useState, useEffect } from 'react'
import { PlaySquare, Youtube, Plus, Trash2, Save, Loader2, BookOpen, Clock, AlertCircle, Play, ChevronRight, Activity, Minimize2, Maximize2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCourses } from '@/hooks/useCourses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function Courses() {
  const { user } = useAuth()
  const { courses, loading, addCourse, deleteCourse, updateNotes, updateProgress } = useCourses(user?.uid)

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

  // Progress states
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeVideoTitle, setActiveVideoTitle] = useState('')
  const [activeVideoId, setActiveVideoId] = useState('')
  const [overrideVideoId, setOverrideVideoId] = useState('')

  // Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Load YouTube Player API on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [])

  // Sync active course on load
  useEffect(() => {
    if (courses.length > 0 && !activeCourse) {
      setActiveCourse(courses[0])
      setLocalNotes(courses[0].notes || '')
      setOverrideVideoId('')
    }
  }, [courses, activeCourse])

  // Sync state values when switching active course
  const handleSelectCourse = (course) => {
    if (isNotesDirty && activeCourse) {
      updateNotes(activeCourse.id, localNotes)
    }
    setActiveCourse(course)
    setLocalNotes(course.notes || '')
    setOverrideVideoId('')
    setIsNotesDirty(false)
    
    // Clear playback states
    setProgressPercent(course.progress?.percent || 0)
    setCurrentTime(course.progress?.currentTime || 0)
    setDuration(course.progress?.duration || 0)
    setActiveVideoTitle(course.progress?.lastVideoTitle || '')
    setActiveVideoId(course.progress?.lastVideoId || '')
  }

  // Handle manual tracking override via slider
  const handleSliderChange = async (e) => {
    const newPercent = parseInt(e.target.value, 10)
    setProgressPercent(newPercent)
    
    if (activeCourse) {
      const targetId = activeVideoId || activeCourse.embedId
      const targetTitle = activeVideoTitle || activeCourse.name
      const progressMap = activeCourse.progress?.progressMap || {}
      
      const newTime = Math.round((newPercent / 100) * (duration || 300))
      
      progressMap[targetId] = {
        percent: newPercent,
        currentTime: newTime,
        duration: duration || 300,
        title: targetTitle,
        updatedAt: Date.now()
      }

      await updateProgress(activeCourse.id, {
        percent: newPercent,
        currentTime: newTime,
        duration: duration || 300,
        lastVideoId: targetId,
        lastVideoTitle: targetTitle,
        progressMap
      })
    }
  }

  // Bind YouTube Player API
  useEffect(() => {
    let player
    let intervalId

    if (!activeCourse) return

    const saveCurrentProgress = (ytPlayer) => {
      if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const time = ytPlayer.getCurrentTime()
        const dur = ytPlayer.getDuration()
        
        let videoId = activeCourse.embedId
        let videoTitle = activeCourse.name
        
        if (typeof ytPlayer.getVideoData === 'function') {
          const data = ytPlayer.getVideoData()
          if (data && data.video_id) {
            videoId = data.video_id
            videoTitle = data.title || activeCourse.name
          }
        }

        if (dur > 0) {
          const percent = Math.round((time / dur) * 100)
          const progressMap = activeCourse.progress?.progressMap || {}
          
          progressMap[videoId] = {
            percent,
            currentTime: Math.round(time),
            duration: Math.round(dur),
            title: videoTitle,
            updatedAt: Date.now()
          }

          updateProgress(activeCourse.id, {
            percent,
            currentTime: Math.round(time),
            duration: Math.round(dur),
            lastVideoId: videoId,
            lastVideoTitle: videoTitle,
            progressMap
          })
        }
      }
    }

    const startTracking = (ytPlayer) => {
      intervalId = setInterval(() => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          const time = ytPlayer.getCurrentTime()
          const dur = ytPlayer.getDuration()
          
          let videoId = activeCourse.embedId
          let videoTitle = activeCourse.name
          
          if (typeof ytPlayer.getVideoData === 'function') {
            const data = ytPlayer.getVideoData()
            if (data && data.video_id) {
              videoId = data.video_id
              videoTitle = data.title || activeCourse.name
            }
          }

          setActiveVideoId(videoId)
          setActiveVideoTitle(videoTitle)

          if (dur > 0) {
            const percent = Math.round((time / dur) * 100)
            setProgressPercent(percent)
            setCurrentTime(Math.round(time))
            setDuration(Math.round(dur))
          }
        }
      }, 3000)
    }

    const initPlayer = () => {
      try {
        player = new window.YT.Player('yt-iframe-player', {
          events: {
            onStateChange: (event) => {
              if (event.data === 1) { // PLAYING
                startTracking(player)
              } else { // PAUSED or ENDED
                clearInterval(intervalId)
                saveCurrentProgress(player)
              }
            }
          }
        })
      } catch (e) {
        console.warn("Could not bind YouTube Player API:", e)
      }
    }

    // Try initializing player once iframe is loaded
    const timer = setTimeout(() => {
      if (window.YT && window.YT.Player) {
        initPlayer()
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }, 1200)

    return () => {
      clearTimeout(timer)
      clearInterval(intervalId)
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy()
        } catch (e) {}
      }
    }
  }, [activeCourse, overrideVideoId])

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
    if (overrideVideoId) {
      return `https://www.youtube.com/embed/${overrideVideoId}?enablejsapi=1`
    }
    return course.isPlaylist
      ? `https://www.youtube.com/embed/videoseries?list=${course.embedId}&enablejsapi=1`
      : `https://www.youtube.com/embed/${course.embedId}?enablejsapi=1`
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0m'
    const m = Math.floor(secs / 60)
    return `${m}m`
  }

  const getHistoryList = (course) => {
    if (!course?.progress?.progressMap) return []
    return Object.entries(course.progress.progressMap).map(([id, val]) => ({
      id,
      ...val
    })).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
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
                  const overallPercent = course.progress?.percent || 0
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={cn(
                        "group flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer relative transition-all duration-300 overflow-hidden",
                        isActive
                          ? "bg-accent/8 border-accent text-accent-light shadow-md shadow-accent/5"
                          : "bg-card border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary hover:bg-hover/30"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-md" />
                      )}
                      <div className="flex items-center justify-between min-w-0 pr-1">
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

                      {/* Mini playlist progress bar */}
                      {overallPercent > 0 && (
                        <div className="w-full bg-border-subtle/50 h-1 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full transition-all"
                            style={{ width: `${overallPercent}%` }}
                          />
                        </div>
                      )}
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
                    {listCollapsed ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    {listCollapsed ? 'Show List' : 'Theater Mode'}
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
                
                {/* 65% width Video + Tracker block */}
                <div className="xl:col-span-2 space-y-4 flex flex-col">
                  {/* Aspect-video Frame */}
                  <div className="w-full aspect-video rounded-2xl border border-border-subtle bg-black overflow-hidden shadow-2xl relative">
                    <iframe
                      id="yt-iframe-player"
                      src={getEmbedUrl(activeCourse)}
                      title={activeCourse.name}
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Playback time tracking widget */}
                  <div className="p-4 bg-surface rounded-2xl border border-border-subtle/70 space-y-3.5 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-4 w-4 text-accent-light" />
                        <span className="font-semibold text-text-secondary">Progress</span>
                      </div>
                      <div className="text-[11px] font-bold text-accent-light">
                        {progressPercent}% Complete
                        {duration > 0 && ` (${formatTime(duration - currentTime)} left)`}
                      </div>
                    </div>

                    {/* Progress Bar (Auto-updates from YouTube Player, read-only) */}
                    <div className="w-full bg-border-subtle/40 h-2.5 rounded-full overflow-hidden border border-white/[0.03]">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Playlist Lecture History Logs */}
                  {activeCourse.isPlaylist && getHistoryList(activeCourse).length > 0 && (
                    <div className="bg-surface rounded-2xl border border-border-subtle/70 p-4 space-y-3.5 shadow-md">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-accent-light" />
                        <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Lecture History Log</span>
                      </div>
                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                        {getHistoryList(activeCourse).map((vid) => (
                          <div
                            key={vid.id}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl border border-border-subtle/50 text-xs transition-colors hover:bg-hover/20",
                              activeVideoId === vid.id ? "bg-accent/5 border-accent/25" : "bg-card"
                            )}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setOverrideVideoId(vid.id)}
                                className="h-7 w-7 rounded-full bg-accent/15 text-accent-light hover:bg-accent hover:text-white shrink-0"
                              >
                                <Play className="h-3 w-3 fill-current ml-0.5" />
                              </Button>
                              <span className="font-semibold text-text-primary truncate" title={vid.title}>
                                {vid.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">
                                {vid.percent}% • {formatTime(vid.duration - vid.currentTime)} left
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 35% width Notepad block */}
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
                    <CardContent className="p-3 flex-1 flex flex-col min-h-[300px]">
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
