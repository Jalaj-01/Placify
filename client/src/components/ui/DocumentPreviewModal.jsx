import { useState, useEffect } from 'react'
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { base64ToBlob, downloadFile, openFileInNewTab, isPdf, isImage } from '@/utils/fileHelpers'

export default function DocumentPreviewModal({ open, onOpenChange, file }) {
  const [blobUrl, setBlobUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Reset controls when file changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setIsLoading(true)
  }, [file])

  // Generate safe blob URL for PDFs/images if base64 to allow in-frame preview
  useEffect(() => {
    if (!open || !file?.url) {
      setBlobUrl('')
      return
    }

    let createdBlobUrl = ''
    if (file.url.startsWith('data:')) {
      const blob = base64ToBlob(file.url, file.type)
      if (blob) {
        createdBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(createdBlobUrl)
      } else {
        setBlobUrl(file.url)
      }
    } else {
      setBlobUrl(file.url)
    }

    return () => {
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl)
      }
    }
  }, [open, file])

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onOpenChange(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isFullscreen, onOpenChange])

  if (!open || !file) return null

  const fileIsPdf = isPdf(file.name || '', file.type || '')
  const fileIsImage = isImage(file.name || '', file.type || '')

  const formatSize = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.4))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'bg-card border border-border-subtle shadow-2xl flex flex-col overflow-hidden transition-all duration-200',
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none w-screen h-screen max-w-none max-h-none'
            : 'w-full max-w-5xl h-[88vh] max-h-[920px] rounded-2xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-4 py-3 border-b border-border-subtle bg-surface/90 flex items-center justify-between gap-3 shrink-0">
          {/* File Meta */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border-subtle shrink-0">
              {fileIsPdf ? (
                <FileText className="h-5 w-5 text-semantic-red" />
              ) : fileIsImage ? (
                <ImageIcon className="h-5 w-5 text-accent-light" />
              ) : (
                <FileText className="h-5 w-5 text-text-muted" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate" title={file.name}>
                {file.name || 'Document'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <span
                  className={cn(
                    'font-bold px-1.5 py-0.2 rounded text-[10px] uppercase',
                    fileIsPdf
                      ? 'bg-semantic-red/10 text-semantic-red'
                      : fileIsImage
                      ? 'bg-accent/15 text-accent-light'
                      : 'bg-hover text-text-muted'
                  )}
                >
                  {fileIsPdf ? 'PDF Document' : fileIsImage ? 'Image' : 'File'}
                </span>
                {file.size ? <span>• {formatSize(file.size)}</span> : null}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Image zoom controls */}
            {fileIsImage && (
              <div className="hidden sm:flex items-center gap-1 bg-card border border-border-subtle rounded-lg p-0.5 mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1 text-text-muted min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary transition-colors border-l border-border-subtle ml-0.5"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Direct Download Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadFile(file.url, file.name, file.type)}
              className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary font-medium"
              title="Download file to device"
            >
              <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>

            {/* Open in external browser tab button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => openFileInNewTab(file.url, file.type)}
              className="h-8 w-8 text-text-muted hover:text-text-primary"
              title="Open in new browser tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Fullscreen toggle button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 text-text-muted hover:text-text-primary"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <div className="h-4 w-px bg-border-subtle mx-0.5" />

            {/* Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-text-muted hover:text-semantic-red hover:bg-semantic-red/10 transition-colors"
              title="Close Preview (Esc)"
            >
              <X className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 min-h-0 relative bg-base/50 overflow-hidden flex flex-col items-center justify-center">
          {fileIsPdf ? (
            <div className="w-full h-full relative flex-1 flex flex-col bg-slate-950">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 z-10 gap-3">
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                  <p className="text-xs text-text-secondary font-medium">Loading PDF document viewer...</p>
                </div>
              )}
              {blobUrl ? (
                <iframe
                  src={blobUrl}
                  title={file.name || 'PDF Preview'}
                  className="w-full h-full border-none flex-1"
                  onLoad={() => setIsLoading(false)}
                />
              ) : null}
            </div>
          ) : fileIsImage ? (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-black/40">
              <img
                src={file.url}
                alt={file.name || 'Image Preview'}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-[75vh] max-w-full object-contain select-none shadow-2xl rounded"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4 max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shadow-inner">
                <FileText className="h-8 w-8 text-text-muted" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{file.name}</h4>
                <p className="text-xs text-text-muted mt-1">{file.size ? formatSize(file.size) : 'File'}</p>
              </div>
              <p className="text-xs text-text-secondary">
                Direct in-frame preview is not supported for this file type. You can download the file or open it in a browser tab.
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={() => downloadFile(file.url, file.name, file.type)} size="sm">
                  <Download className="h-4 w-4 mr-1.5" /> Download File
                </Button>
                <Button onClick={() => openFileInNewTab(file.url, file.type)} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
