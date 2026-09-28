import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Film, GraduationCap, ArrowLeft, Sparkles, BookOpen,
  Award, CheckCircle2, Video, Boxes, ListChecks, ChevronRight
} from 'lucide-react'
import Dsa3DVideoTutorial from '@/components/dsa/tutorials/Dsa3DVideoTutorial'
import { DSA_SYLLABUS } from '@/data/dsaSyllabusData'
import { Button } from '@/components/ui/button'

export default function DsaMasterclassPage() {
  const navigate = useNavigate()
  const [selectedTopic, setSelectedTopic] = useState(() => DSA_SYLLABUS[0])

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Return to 3D Lab Header */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-md shadow-rose-500/10">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-text-primary tracking-tight">
                  DSA 3D Masterclass Video Academy
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[11px] font-bold border border-rose-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                  Placify Originals
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold border border-cyan-500/25">
                  4K 60FPS WebGL
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Full video lecture curriculum with 3D WebGL animations, Soft Female Voice AI instruction, and multi-language code synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dsa-lab')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md shadow-accent/25 transition-all"
            >
              <Boxes className="w-4 h-4" />
              <span>Launch 3D Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Masterclass Academy Component */}
      <Dsa3DVideoTutorial
        activeTopic={selectedTopic}
        steps={[]}
        currentStep={{}}
        currentStepIndex={0}
        onStepChange={() => {}}
      />
    </div>
  )
}
