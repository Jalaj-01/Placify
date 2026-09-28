import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2,
  Film, Sparkles, Clock, CheckCircle2, ChevronRight, Video,
  Compass, ExternalLink, Bookmark, Share2, Layers, Award,
  Check, ListChecks, FileText, UserCheck, ChevronDown, ChevronUp,
  Mic, Headphones, FastForward, Rewind, Radio, MonitorPlay,
  Subtitles, Cpu, Code2, Eye, Sliders
} from 'lucide-react'
import DsaCanvas3D from '@/components/dsa/visualizer/DsaCanvas3D'
import { Button } from '@/components/ui/button'

export default function PlacifyMasterclassVideoPlayer({ lesson, onToggleComplete, isCompleted }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [sceneProgress, setSceneProgress] = useState(0) // 0 to 100 within active scene
  const [totalProgress, setTotalProgress] = useState(0) // 0 to 100 of overall video
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [showCodeOverlay, setShowCodeOverlay] = useState(true)
  const [showTelemetry, setShowTelemetry] = useState(true)
  const [volume, setVolume] = useState(0.95)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [waveformBars, setWaveformBars] = useState([40, 65, 30, 80, 50, 95, 45, 70, 35, 85, 60, 90, 55, 75])
  const [codeLang, setCodeLang] = useState('cpp') // 'c' | 'cpp' | 'python' | 'java'

  const videoContainerRef = useRef(null)
  const utteranceRef = useRef(null)

  // Multi-Language Code Snippet Resolver (C, C++, Python, Java)
  const resolveSceneCode = (scene, lang) => {
    if (scene?.codeSnippets && scene.codeSnippets[lang]) {
      return {
        code: scene.codeSnippets[lang],
        activeLine: scene.activeLines?.[lang] || scene.activeLine || 1,
      }
    }

    const base = scene?.codeSnippet || ''
    if (lang === 'c') {
      return {
        code: `// C Language (ANSI / C99)\n#include <stdio.h>\n#include <stdlib.h>\n\n// 1. Memory Operation\n${base.replace(/const |let /g, 'int ')}`,
        activeLine: (scene?.activeLine || 1) + 4,
      }
    }
    if (lang === 'cpp') {
      return {
        code: `// C++ STL Implementation\n#include <iostream>\n#include <vector>\nusing namespace std;\n\n${base.replace(/const |let /g, 'auto ')}`,
        activeLine: (scene?.activeLine || 1) + 4,
      }
    }
    if (lang === 'python') {
      const pyLines = base
        .split('\n')
        .map((line) => line.replace(/const |let /g, '').replace(/;/g, '').replace(/console\.log/g, 'print'))
        .join('\n')
      return {
        code: `# Python 3 Solution\n${pyLines}`,
        activeLine: (scene?.activeLine || 1) + 1,
      }
    }
    if (lang === 'java') {
      return {
        code: `// Java Solution\npublic class Solution {\n  public void execute() {\n    ${base.replace(/const |let /g, 'var ')}\n  }\n}`,
        activeLine: (scene?.activeLine || 1) + 2,
      }
    }
    return { code: base, activeLine: scene?.activeLine || 1 }
  }

  const scenes = lesson?.videoScenes || [
    {
      timestamp: '00:00',
      durationSeconds: 12,
      title: 'Problem Definition & Memory Layout',
      subtitle: 'Contiguous Hardware Cells and Physical RAM Addressing',
      narration: `Welcome to this Placify Original Masterclass on ${lesson?.title || 'Data Structures'}. In this lecture, we explore the fundamental memory models, pointer architectures, and algorithmic invariants.`,
      codeSnippet: `// 1. Data Structure Allocation\nconst memoryBlock = new Array(5).fill(0);\n// Memory Address: 0x7ffee4\nconsole.log("Allocated contiguous memory block.");`,
      activeLine: 2,
      sceneState: {
        type: 'array_1d',
        data: [10, 25, 40, 65, 80],
        pointers: [{ name: 'HEAD', index: 0, color: 'accent' }],
        highlightedIndices: [0]
      },
      telemetry: { time: 'O(1)', space: 'O(1)', address: '0x7ffee4', cacheState: 'L1 Hit (100%)' }
    }
  ]

  const activeScene = scenes[currentSceneIndex] || scenes[0]

  // Intelligent Soft Female Voice Selector
  const getSoftFemaleVoice = () => {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()

    const preferred = [
      'Google UK English Female',
      'Google US English',
      'Microsoft Jenny',
      'Microsoft Zira',
      'Microsoft Aria',
      'Microsoft Sonia',
      'Samantha',
      'Victoria',
      'Karen',
      'Moira',
      'Tessa',
      'Fiona',
    ]

    for (const name of preferred) {
      const match = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()))
      if (match) return match
    }

    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('girl'))
    )
    if (femaleVoice) return femaleVoice

    return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null
  }

  // Audio Waveform Dancing Animation when voice speaks
  useEffect(() => {
    if (!isVoiceSpeaking || isMuted) {
      setWaveformBars([15, 20, 15, 25, 20, 30, 20, 25, 15, 20, 15, 25, 20, 15])
      return
    }
    const interval = setInterval(() => {
      setWaveformBars(
        Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 25)
      )
    }, 120)
    return () => clearInterval(interval)
  }, [isVoiceSpeaking, isMuted])

  // Narrate current scene with Soft Female Voice
  const speakSceneNarration = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    if (!isVoiceEnabled || isMuted || !text) {
      setIsVoiceSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    const softVoice = getSoftFemaleVoice()
    if (softVoice) utterance.voice = softVoice

    utterance.pitch = 1.08 // Soft feminine pitch
    utterance.rate = 0.92 * playbackSpeed // Calm, unhurried cadence
    utterance.volume = volume

    utterance.onstart = () => setIsVoiceSpeaking(true)
    utterance.onend = () => setIsVoiceSpeaking(false)
    utterance.onerror = () => setIsVoiceSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // Play / Pause Audio and Stepper Loop
  useEffect(() => {
    if (!isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause()
      }
      setIsVoiceSpeaking(false)
      return
    }

    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsVoiceSpeaking(true)
    } else {
      speakSceneNarration(activeScene?.narration)
    }

    // Auto-advance scenes based on durationSeconds
    const sceneDurationMs = ((activeScene?.durationSeconds || 12) * 1000) / playbackSpeed
    const stepInterval = 100 // update progress every 100ms
    let elapsed = 0

    const progressTimer = setInterval(() => {
      elapsed += stepInterval
      const currentPct = Math.min(100, (elapsed / sceneDurationMs) * 100)
      setSceneProgress(currentPct)

      // Calculate total overall video progress
      const totalScenes = scenes.length
      const baseProgress = (currentSceneIndex / totalScenes) * 100
      const overall = baseProgress + (currentPct / totalScenes)
      setTotalProgress(Math.min(100, overall))

      if (elapsed >= sceneDurationMs) {
        clearInterval(progressTimer)
        if (currentSceneIndex < scenes.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1)
          setSceneProgress(0)
        } else {
          // Reached end of video
          setIsPlaying(false)
          setSceneProgress(100)
          setTotalProgress(100)
          if (!isCompleted && onToggleComplete) {
            onToggleComplete(lesson.id)
          }
        }
      }
    }, stepInterval)

    return () => {
      clearInterval(progressTimer)
    }
  }, [isPlaying, currentSceneIndex, playbackSpeed, isVoiceEnabled, isMuted, volume, lesson?.id])

  // When currentSceneIndex changes, trigger audio for new scene
  useEffect(() => {
    if (isPlaying) {
      speakSceneNarration(activeScene?.narration)
    }
  }, [currentSceneIndex])

  // Stop speech when component unmounts or lesson changes
  useEffect(() => {
    setCurrentSceneIndex(0)
    setSceneProgress(0)
    setTotalProgress(0)
    setIsPlaying(false)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [lesson?.id])

  const togglePlay = () => {
    if (!isPlaying && totalProgress >= 100) {
      setCurrentSceneIndex(0)
      setSceneProgress(0)
      setTotalProgress(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSkip = (seconds) => {
    if (seconds > 0) {
      if (currentSceneIndex < scenes.length - 1) {
        setCurrentSceneIndex((prev) => prev + 1)
        setSceneProgress(0)
      }
    } else {
      if (currentSceneIndex > 0) {
        setCurrentSceneIndex((prev) => prev - 1)
        setSceneProgress(0)
      } else {
        setSceneProgress(0)
      }
    }
  }

  const handleSelectScene = (index) => {
    setCurrentSceneIndex(index)
    setSceneProgress(0)
    const baseProgress = (index / scenes.length) * 100
    setTotalProgress(baseProgress)
    if (isPlaying) {
      speakSceneNarration(scenes[index]?.narration)
    }
  }

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={videoContainerRef}
      className={`relative w-full bg-[#070b14] rounded-2xl overflow-hidden border border-border-subtle shadow-2xl transition-all flex flex-col ${
        isFullscreen ? 'h-screen p-4' : 'min-h-[560px]'
      }`}
    >
      {/* 1. TOP VIDEO HEADER HUD */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-b from-black/80 via-black/50 to-transparent z-20 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono font-bold text-[10px] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>PLACIFY ORIGINALS</span>
          </div>

          <span className="text-white/30 text-xs">•</span>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-md">
              {lesson?.title}
            </h3>
            <p className="text-[11px] text-text-muted flex items-center gap-1.5">
              <span>{lesson?.creator || 'Dr. Alisha Sharma (Placify AI Faculty)'}</span>
              <span>•</span>
              <span className="text-accent-light font-medium">
                Scene {currentSceneIndex + 1} of {scenes.length}: {activeScene?.title}
              </span>
            </p>
          </div>
        </div>

        {/* Badges & Mode Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeOverlay(!showCodeOverlay)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              showCodeOverlay
                ? 'bg-accent/20 border-accent/40 text-accent-light'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            title="Toggle Live Code HUD"
          >
            <Code2 className="w-3 h-3" />
            <span>Code</span>
          </button>

          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              showTelemetry
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            title="Toggle Telemetry"
          >
            <Cpu className="w-3 h-3" />
            <span>Telemetry</span>
          </button>

          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono font-bold text-[10px] border border-white/15">
            4K UHD 60FPS
          </span>
        </div>
      </div>

      {/* 2. CINEMATIC 3D WEBGL VIDEO CANVAS VIEWPORT */}
      <div className="relative flex-1 w-full min-h-[360px] sm:min-h-[420px] bg-[#090d16] flex items-center justify-center overflow-hidden">
        {/* Render Live 3D Scene */}
        <div className="absolute inset-0 w-full h-full">
          <DsaCanvas3D sceneState={activeScene?.sceneState} />
        </div>

        {/* Ambient Vignette & Cinema Letterboxing Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Watermark Logo */}
        <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2 opacity-35">
          <div className="w-6 h-6 rounded-lg bg-accent/40 border border-accent flex items-center justify-center font-bold text-white text-[11px]">
            P
          </div>
          <span className="text-white font-bold tracking-widest text-[11px] font-mono uppercase">
            PLACIFY 3D NATIVE
          </span>
        </div>

        {/* Floating Live Code Overlay (Top-Left) with Language Switcher */}
        {showCodeOverlay && (() => {
          const activeCodeData = resolveSceneCode(activeScene, codeLang)
          return (
            <div className="absolute top-4 left-4 max-w-xs sm:max-w-md w-full bg-black/80 backdrop-blur-md rounded-xl border border-white/15 p-3 shadow-2xl text-[11px] font-mono text-white/90 animate-fadeIn pointer-events-auto z-10">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-text-muted gap-2">
                <div className="flex items-center gap-1.5 text-accent-light font-bold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Algorithm Sync</span>
                  <span className="text-white/40 font-normal">Line {activeCodeData.activeLine}</span>
                </div>

                {/* Language Switcher Toolbar (C, C++, Python, Java) */}
                <div className="flex items-center gap-0.5 bg-white/10 p-0.5 rounded-lg border border-white/10 font-mono text-[10px]">
                  {[
                    { id: 'c', label: 'C' },
                    { id: 'cpp', label: 'C++' },
                    { id: 'python', label: 'Python' },
                    { id: 'java', label: 'Java' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setCodeLang(id)}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        codeLang === id
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-0.5 leading-relaxed overflow-x-auto max-h-[160px] sm:max-h-[200px] pr-1">
                {activeCodeData.code.split('\n').map((line, i) => {
                  const lineNum = i + 1
                  const isActive = lineNum === activeCodeData.activeLine
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-1.5 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-accent/30 text-white font-bold border-l-2 border-accent'
                          : 'text-white/60 hover:text-white/90'
                      }`}
                    >
                      <span className="w-4 text-white/30 text-[9px] select-none text-right">
                        {lineNum}
                      </span>
                      <span className="truncate">{line}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Floating Telemetry & Memory Card (Bottom-Right) */}
        {showTelemetry && activeScene?.telemetry && (
          <div className="absolute bottom-16 right-4 bg-black/80 backdrop-blur-md rounded-xl border border-white/15 p-2.5 shadow-2xl text-[11px] text-white/90 animate-fadeIn pointer-events-auto hidden md:block z-10 max-w-[240px]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
              <Cpu className="w-3 h-3" />
              <span>Memory Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono">
              <span className="text-white/50">Time:</span>
              <span className="text-emerald-300 font-bold">{activeScene.telemetry.time}</span>
              <span className="text-white/50">Space:</span>
              <span className="text-cyan-300 font-bold">{activeScene.telemetry.space}</span>
              <span className="text-white/50">Address:</span>
              <span className="text-accent-amber font-bold">{activeScene.telemetry.address}</span>
              <span className="text-white/50">Cache:</span>
              <span className="text-white/80 truncate">{activeScene.telemetry.cacheState}</span>
            </div>
          </div>
        )}

        {/* Clean Center Play Button Overlay if Paused - Zero backdrop blur so 3D scene is 100% visible */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <button
              onClick={togglePlay}
              className="pointer-events-auto px-5 py-2.5 rounded-full bg-accent/90 hover:bg-accent text-white flex items-center gap-2.5 shadow-2xl shadow-accent/60 hover:scale-105 active:scale-95 transition-all border border-white/20 backdrop-blur-sm group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wide uppercase">Play 3D Lecture</span>
            </button>
          </div>
        )}

        {/* Closed Captions / Real-Time Subtitles Banner */}
        {showSubtitles && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-xl w-[90%] bg-black/85 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/15 shadow-2xl pointer-events-none z-10">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-accent-light uppercase tracking-wider mb-0.5">
              <Headphones className="w-3 h-3" />
              <span>Dr. Alisha Sharma (AI Instructor Narration)</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-white/95 leading-snug drop-shadow-md">
              "{activeScene?.narration}"
            </p>
          </div>
        )}
      </div>

      {/* 3. VIDEO TIMELINE & HUD CONTROLS */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-t border-white/10 space-y-2.5 z-20">
        {/* Scrubber Track with Scene Markers */}
        <div className="relative flex items-center group cursor-pointer">
          <div className="w-full h-1.5 group-hover:h-2.5 bg-white/15 rounded-full overflow-hidden transition-all relative">
            {/* Played Fill */}
            <div
              className="h-full bg-gradient-to-r from-accent via-rose-500 to-accent-light rounded-full transition-all relative"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          {/* Scene Checkpoint Ticks */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5">
            {scenes.map((_, idx) => (
              <span
                key={idx}
                className="w-1 h-2 -translate-y-0.5 bg-white/40 rounded-full"
                title={`Scene ${idx + 1}`}
              />
            ))}
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={totalProgress}
            onChange={(e) => {
              const val = Number(e.target.value)
              setTotalProgress(val)
              const sceneIdx = Math.min(
                scenes.length - 1,
                Math.floor((val / 100) * scenes.length)
              )
              handleSelectScene(sceneIdx)
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>

        {/* Video Control Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Left: Playback & Timestamps */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-accent hover:bg-accent-light text-white shadow-md shadow-accent/30 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => handleSkip(-1)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Scene (-10s)"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(1)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Scene (+10s)"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Time Indicator */}
            <div className="text-xs font-mono text-white/70 ml-1">
              <span className="text-white font-bold">{activeScene?.timestamp || '00:00'}</span>
              <span className="text-white/30 mx-1">/</span>
              <span>{lesson?.duration || '12:00'}</span>
            </div>

            {/* Soft Female Voice Dancing Waveform */}
            <div className="hidden lg:flex items-center gap-0.5 ml-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <Mic className="w-3 h-3 text-accent mr-1" />
              <div className="flex items-end gap-0.5 h-3">
                {waveformBars.map((height, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-100 ${
                      isVoiceSpeaking ? 'bg-accent' : 'bg-white/20'
                    }`}
                    style={{ height: `${Math.max(15, height)}%` }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-accent-light ml-1.5 font-bold">
                {isVoiceSpeaking ? 'AI Voice Active' : 'AI Voice Ready'}
              </span>
            </div>
          </div>

          {/* Right: Audio, Speed, CC, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isVoiceEnabled
                  ? 'text-accent-light bg-accent/15 border border-accent/30'
                  : 'text-white/40 hover:text-white bg-white/5'
              }`}
              title={isVoiceEnabled ? 'Voice Narrator Enabled' : 'Voice Narrator Muted'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Subtitles CC Toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                showSubtitles
                  ? 'bg-accent/20 border-accent/40 text-accent-light'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
              }`}
              title="Toggle Closed Captions (CC)"
            >
              CC
            </button>

            {/* Playback Speed Multipliers */}
            <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    playbackSpeed === speed
                      ? 'bg-accent text-white font-bold shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLICKABLE SCENE CHAPTERS TRACKER */}
      <div className="p-3 bg-[#060a14] border-t border-white/5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
          <span className="font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-accent" />
            <span>Video Scenes & Conceptual Chapters:</span>
          </span>
          <span className="text-white/40 font-mono text-[10px]">
            {scenes.length} Masterclass Phases
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {scenes.map((sc, idx) => {
            const isCurrent = currentSceneIndex === idx
            return (
              <button
                key={idx}
                onClick={() => handleSelectScene(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-accent/20 border-accent/50 text-white shadow-lg shadow-accent/15 ring-1 ring-accent/40'
                    : 'bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full text-[10px] font-mono">
                  <span className={`px-1.5 py-0.2 rounded font-bold ${isCurrent ? 'bg-accent text-white' : 'bg-white/10 text-white/60'}`}>
                    {sc.timestamp}
                  </span>
                  {isCurrent && isPlaying && (
                    <span className="text-[9px] text-rose-400 font-bold uppercase animate-pulse">
                      Playing Now
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold mt-1.5 truncate text-white">
                  {sc.title}
                </div>
                <div className="text-[10px] text-white/40 truncate mt-0.5">
                  {sc.subtitle || sc.narration.slice(0, 45) + '...'}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
