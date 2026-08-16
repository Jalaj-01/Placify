import React from 'react'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Placify Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    localStorage.removeItem('placement_tracker_session')
    localStorage.removeItem('placement_tracker_profile')
    localStorage.removeItem('placify_active_role')
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#12131c] border border-white/10 shadow-2xl text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-xs text-gray-400 mt-1">
                {this.state.error?.message || 'A client render exception occurred.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Cache & Reload</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
