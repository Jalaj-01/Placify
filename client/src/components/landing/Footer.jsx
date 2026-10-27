import { Github, Twitter, Linkedin, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-slate-200/80 py-14 px-4 sm:px-8 bg-white/70 backdrop-blur-xl relative z-20 text-xs text-slate-500 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Status */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center font-black text-xs shadow-md">
              P
            </div>
            <span className="font-extrabold text-lg text-[#1E1B4B] tracking-tight">Placify</span>
          </div>

          <p className="text-slate-600 leading-relaxed font-normal">
            The modern placement preparation and academic operating system for students, faculty, and research scholars.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Column 2: Student Placement Suite */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-[#1E1B4B] uppercase tracking-wider text-xs">For Students</h4>
          <ul className="space-y-1.5 font-medium text-slate-600">
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Placement Kanban Board</a></li>
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Coding Problem Log</a></li>
            <li><a href="#features" className="hover:text-[#2563EB] transition-colors">Subject Competency Radar</a></li>
            <li><a href="#features" className="hover:text-[#2563EB] transition-colors">AI Placement Coach & Mock OA</a></li>
            <li><a href="#features" className="hover:text-[#2563EB] transition-colors">1v1 Peer Mock Practice</a></li>
          </ul>
        </div>

        {/* Column 3: Faculty & Research */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-[#1E1B4B] uppercase tracking-wider text-xs">Faculty & Research</h4>
          <ul className="space-y-1.5 font-medium text-slate-600">
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Course Syllabus Pace Chart</a></li>
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Digital Gradebook Vault</a></li>
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Classroom Vault & Notes</a></li>
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">PhD Research Roadmap</a></li>
            <li><a href="#role-sandbox" className="hover:text-[#2563EB] transition-colors">Live Sync Study Rooms</a></li>
          </ul>
        </div>

        {/* Column 4: Platform & Community */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-[#1E1B4B] uppercase tracking-wider text-xs">Platform & Community</h4>
          <ul className="space-y-1.5 font-medium text-slate-600">
            <li><a href="#pricing" className="hover:text-[#2563EB] transition-colors">University Campus License</a></li>
            <li><span className="text-slate-400">FERPA & Student Privacy Compliance</span></li>
            <li><span className="text-slate-400">Institutional SLA & Cloud Security</span></li>
          </ul>

          <div className="flex items-center gap-2 pt-2 text-slate-600">
            <a
              href="https://github.com/Jalaj-01/Placify"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="GitHub Repository"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <p>© {new Date().getFullYear()} Placify Platform • Built for Students, Faculty & Research Scholars. All rights reserved.</p>
        <p className="flex items-center gap-1">Crafted with precision for campus success</p>
      </div>
    </footer>
  )
}
