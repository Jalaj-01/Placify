import { Github, Twitter, Linkedin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-border/40 py-16 px-6 bg-base relative z-20 text-xs text-text-muted font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1: Brand & Status */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-accent via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-accent/20">
              <div className="h-full w-full rounded-[14px] bg-base flex items-center justify-center">
                <span className="font-black text-xs tracking-tighter bg-gradient-to-tr from-accent via-cyan-400 to-white bg-clip-text text-transparent">
                  CG
                </span>
              </div>
            </div>
            <span className="font-black text-lg text-text-primary uppercase tracking-tight">CampusGrid</span>
          </div>

          <p className="text-text-secondary leading-relaxed font-medium">
            The next-generation academic operating system for Students, Faculty, and PhD Scholars.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-semantic-green/10 border border-semantic-green/30 text-[11px] text-semantic-green font-bold font-mono">
            <span className="h-2 w-2 rounded-full bg-semantic-green animate-ping" />
            <span>🟢 All Systems Operational</span>
          </div>
        </div>

        {/* Column 2: Candidate Tools */}
        <div className="space-y-3">
          <h4 className="font-black text-text-primary uppercase tracking-wider text-xs">For Candidates</h4>
          <ul className="space-y-2 font-medium text-text-secondary">
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">Placement Kanban Board</a></li>
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">1v1 Peer Mock Matcher</a></li>
            <li><a href="#features" className="hover:text-accent transition-colors">Distraction-Free Theater</a></li>
            <li><a href="#features" className="hover:text-accent transition-colors">Wasm Code Playground</a></li>
            <li><a href="#features" className="hover:text-accent transition-colors">Subject Competency Radar</a></li>
          </ul>
        </div>

        {/* Column 3: Faculty & PhD Vault */}
        <div className="space-y-3">
          <h4 className="font-black text-text-primary uppercase tracking-wider text-xs">Faculty & Research</h4>
          <ul className="space-y-2 font-medium text-text-secondary">
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">Recharts Syllabus Pace</a></li>
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">Digital Gradebook Vault</a></li>
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">AI Quiz & MCQ Generator</a></li>
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">Supervisor Sync Logbook</a></li>
            <li><a href="#role-sandbox" className="hover:text-accent transition-colors">SERB Grant Claim Tracker</a></li>
          </ul>
        </div>

        {/* Column 4: Platform & Security */}
        <div className="space-y-3">
          <h4 className="font-black text-text-primary uppercase tracking-wider text-xs">Platform & Security</h4>
          <ul className="space-y-2 font-medium text-text-secondary">
            <li><a href="#pricing" className="hover:text-accent transition-colors">Campus Enterprise License</a></li>
            <li><span className="text-text-muted">Privacy Policy & FERPA Compliance</span></li>
            <li><span className="text-text-muted">ISO 27001 Security Standard</span></li>
          </ul>

          <div className="flex items-center gap-3 pt-2 text-text-secondary">
            <a href="https://github.com/Jalaj-01/Placify" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-hover hover:text-accent transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-hover hover:text-accent transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-hover hover:text-accent transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
        <p>© {new Date().getFullYear()} CampusGrid Platform • Built for Students, Faculty & Research Scholars. All rights reserved.</p>
      </div>
    </footer>
  )
}
