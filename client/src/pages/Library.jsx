import { useState } from 'react'
import { FolderOpen, FileUp, FileText, ImageIcon, Search, Trash2, ExternalLink, Loader2, ArrowRight, Share2, Eye } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import ShareDialog from '@/components/share/ShareDialog'
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { storage } from '@/config/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { cn } from '@/lib/utils'
import { openFileInNewTab } from '@/utils/fileHelpers'
import { apiCall } from '@/services/apiClient'

export default function Library() {
  const { user } = useAuth()
  const { libraryDocs, loading, addDoc, deleteDoc } = useLibrary(user?.uid)

  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  
  // Dialog state
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null)
  const [shareItemData, setShareItemData] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)


  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const uploadFilesList = async (files) => {
    setUploading(true)
    setError('')
    setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Under 1MB: Store as Base64 in Firestore directly (zero setup, works offline/instantly!)
        if (file.size <= 1024 * 1024) {
          setUploadProgress(30)
          const base64Url = await readFileAsBase64(file)
          setUploadProgress(70)
          await addDoc(file.name, base64Url, file.type, file.size)
          setUploadProgress(100)
        } else {
          // Fallback to local server upload to support files of any size without Firebase Storage configuration
          setUploadProgress(40)
          const base64Url = await readFileAsBase64(file)
          setUploadProgress(70)
          
          const uploadRes = await apiCall('/api/library/upload', {
            method: 'POST',
            body: {
              name: file.name,
              base64Data: base64Url
            }
          })
          
          await addDoc(file.name, uploadRes.url, file.type, file.size)
          setUploadProgress(100)
        }
      }
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await uploadFilesList(files)
    e.target.value = '' // Clear file value so same file can be selected again
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    await uploadFilesList(files)
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredDocs = libraryDocs.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <FolderOpen className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">Resource Library</h1>
          <p className="text-secondary text-text-secondary font-medium">Store and review your preparation sheets, syllabus PDFs, and note screenshots</p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed border-border-subtle bg-card transition-all cursor-pointer select-none",
          isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "hover:border-border-hover"
        )}
      >
        <CardContent className="p-6">
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-6 w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border-subtle">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-accent-light animate-spin" />
              ) : (
                <FileUp className="h-6 w-6 text-accent-light" />
              )}
            </div>
            <div className="text-center">
              {uploading ? (
                <span className="text-body font-semibold text-accent-light">
                  Uploading: {uploadProgress}%
                </span>
              ) : (
                <span className="text-body font-semibold text-accent-light">
                  {isDragging ? 'Drop files here!' : 'Click or Drag files to upload'}
                </span>
              )}
              <p className="text-micro text-text-muted mt-1">Accepts multiple images or PDF study guides</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </CardContent>
      </Card>

      {error && <p className="text-xs text-semantic-red font-medium">{error}</p>}

      {/* Library Inventory */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search resources by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-card border border-border-subtle">
            <p className="text-secondary text-text-secondary text-xs">No resources uploaded yet. Drag files above to build your prep repository.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map((docItem) => {
              const isImage = docItem.type?.startsWith('image/')
              return (
                <Card key={docItem.id} className="bg-card border border-border-subtle hover:border-accent/40 transition-all flex flex-col group overflow-hidden shadow-xs hover:shadow-md">
                  {/* File Preview Thumbnail */}
                  <div
                    onClick={() => setPreviewDoc(docItem)}
                    className="h-32 bg-surface flex items-center justify-center border-b border-border-subtle relative overflow-hidden shrink-0 cursor-pointer"
                    title="Click to view file in platform"
                  >
                    {isImage ? (
                      <img
                        src={docItem.url}
                        alt={docItem.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 transition-transform group-hover:scale-105">
                        <FileText className="h-10 w-10 text-semantic-red" />
                        <span className="text-[10px] font-bold text-semantic-red bg-semantic-red/10 px-2 py-0.5 rounded uppercase">PDF Doc</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="px-2.5 py-1 rounded-full bg-surface/90 text-text-primary text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                        <Eye className="h-3.5 w-3.5 text-accent" />
                        <span>Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <CardContent className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <h4
                        onClick={() => setPreviewDoc(docItem)}
                        className="text-xs font-bold text-text-primary truncate cursor-pointer hover:text-accent transition-colors"
                        title={`Click to view: ${docItem.name}`}
                      >
                        {docItem.name}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-1">
                        {formatSize(docItem.size)} • {formatDate(docItem.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewDoc(docItem)}
                        className="h-7 w-7 text-text-muted hover:text-accent hover:bg-hover"
                        title="View file in platform"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShareItemData({ type: 'library', data: docItem })}
                        className="h-7 w-7 text-text-muted hover:text-accent-light hover:bg-hover"
                        title="Share Document"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmDoc(docItem)}
                        className="h-7 w-7 text-text-muted hover:text-semantic-red hover:bg-hover"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* In-Platform Document & Image Preview Modal */}
      <DocumentPreviewModal
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        file={previewDoc}
      />

      {/* Confirmation Dialog */}
      <Dialog open={!!deleteConfirmDoc} onOpenChange={() => setDeleteConfirmDoc(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Document</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete &quot;{deleteConfirmDoc?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmDoc) {
                  await deleteDoc(deleteConfirmDoc.id)
                }
                setDeleteConfirmDoc(null)
              }}
            >
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {shareItemData && (
        <ShareDialog
          open={!!shareItemData}
          onOpenChange={(val) => !val && setShareItemData(null)}
          itemType={shareItemData.type}
          itemData={shareItemData.data}
          senderUid={user?.uid}
          senderEmail={user?.email}
        />
      )}
    </div>
  )
}
