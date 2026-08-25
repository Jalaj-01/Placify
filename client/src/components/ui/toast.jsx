import { useState, useCallback, useRef, createContext, useContext } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trash2 } from "lucide-react"

// ── Toast Context ────────────────────────────────────────────────
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null) // { message, onConfirm, onCancel }
  const timerRefs = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timerRefs.current[id])
  }, [])

  const addToast = useCallback(({ title, description, type = "default", duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random()}`
    setToasts((prev) => [...prev.slice(-4), { id, title, description, type }])
    timerRefs.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
    return id
  }, [])

  const success = useCallback((title, description) => addToast({ title, description, type: "success" }), [addToast])
  const error = useCallback((title, description) => addToast({ title, description, type: "error", duration: 6000 }), [addToast])
  const warning = useCallback((title, description) => addToast({ title, description, type: "warning" }), [addToast])
  const info = useCallback((title, description) => addToast({ title, description, type: "info" }), [addToast])

  // Returns a Promise that resolves true (confirmed) or false (cancelled)
  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirm({
        message,
        title: options.title || "Are you sure?",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        destructive: options.destructive !== false,
        onConfirm: () => { setConfirm(null); resolve(true) },
        onCancel: () => { setConfirm(null); resolve(false) },
      })
    })
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info, dismiss, confirm: showConfirm }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {confirm && <ConfirmDialog {...confirm} />}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

// ── Confirm Dialog ───────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      {/* Card */}
      <div className="relative bg-card border border-border-subtle rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", destructive ? "bg-red-500/15" : "bg-yellow-500/15"].join(" ")}>
            {destructive
              ? <Trash2 className="h-4 w-4 text-red-400" />
              : <AlertTriangle className="h-4 w-4 text-yellow-400" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-hover border border-border-subtle text-text-secondary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={["px-4 py-2 text-xs font-bold rounded-xl text-white transition-colors shadow-sm", destructive ? "bg-red-500 hover:bg-red-600" : "bg-accent hover:bg-accent/90"].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toast Notification ───────────────────────────────────────────
const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info, default: Info }
const STYLES = {
  success: "border-l-4 border-l-green-500 bg-green-500/10",
  error: "border-l-4 border-l-red-500 bg-red-500/10",
  warning: "border-l-4 border-l-yellow-500 bg-yellow-500/10",
  info: "border-l-4 border-l-blue-500 bg-blue-500/10",
  default: "border-l-4 border-border-subtle bg-card",
}
const ICON_COLORS = {
  success: "text-green-400", error: "text-red-400",
  warning: "text-yellow-400", info: "text-blue-400", default: "text-text-muted",
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div
            key={t.id}
            className={["flex items-start gap-3 px-4 py-3 rounded-2xl border border-border-subtle shadow-2xl backdrop-blur-md pointer-events-auto",
              "animate-in slide-in-from-right-5 fade-in duration-300",
              STYLES[t.type] || STYLES.default].join(" ")}
          >
            <Icon className={["h-4 w-4 mt-0.5 shrink-0", ICON_COLORS[t.type] || ICON_COLORS.default].join(" ")} />
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-xs font-bold text-text-primary leading-snug">{t.title}</p>}
              {t.description && <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{t.description}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
