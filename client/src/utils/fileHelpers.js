/**
 * Helper utilities to safely preview, download, and open files (Base64, Blobs, or HTTP/HTTPS URLs).
 * Modern browsers block top-level data: URI navigations, so Base64 strings
 * are converted to local Blob URLs for in-platform preview, iframe rendering, and downloading.
 */

export function base64ToBlob(url, mimeType = '') {
  if (!url) return null
  try {
    const parts = url.split(';base64,')
    const contentType = mimeType || (parts[0] ? parts[0].split(':')[1] : 'application/octet-stream')
    const base64Data = parts[1] || parts[0]
    const raw = window.atob(base64Data)
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }

    return new Blob([uInt8Array], { type: contentType })
  } catch (e) {
    console.error('Failed to convert base64 to Blob:', e)
    return null
  }
}

export function getFileViewableUrl(url, mimeType = '') {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('data:')) {
    const blob = base64ToBlob(url, mimeType)
    if (blob) {
      return URL.createObjectURL(blob)
    }
  }
  return url
}

export function isPdf(fileOrUrl, mimeType = '') {
  if (mimeType && mimeType.toLowerCase().includes('pdf')) return true
  if (typeof fileOrUrl === 'string') {
    if (fileOrUrl.startsWith('data:application/pdf')) return true
    if (fileOrUrl.toLowerCase().split('?')[0].endsWith('.pdf')) return true
  }
  if (fileOrUrl && typeof fileOrUrl === 'object') {
    if (fileOrUrl.type && fileOrUrl.type.toLowerCase().includes('pdf')) return true
    if (fileOrUrl.name && fileOrUrl.name.toLowerCase().endsWith('.pdf')) return true
  }
  return false
}

export function isImage(fileOrUrl, mimeType = '') {
  if (mimeType && mimeType.toLowerCase().startsWith('image/')) return true
  if (typeof fileOrUrl === 'string') {
    if (fileOrUrl.startsWith('data:image/')) return true
    const ext = fileOrUrl.toLowerCase().split('?')[0]
    if (/\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(ext)) return true
  }
  if (fileOrUrl && typeof fileOrUrl === 'object') {
    if (fileOrUrl.type && fileOrUrl.type.toLowerCase().startsWith('image/')) return true
    if (fileOrUrl.name && /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(fileOrUrl.name.toLowerCase())) return true
  }
  return false
}

export function downloadFile(url, fileName = 'download', mimeType = '') {
  if (!url) return
  try {
    let downloadUrl = url
    let shouldRevoke = false

    if (url.startsWith('data:')) {
      const blob = base64ToBlob(url, mimeType)
      if (blob) {
        downloadUrl = URL.createObjectURL(blob)
        shouldRevoke = true
      }
    }

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName || 'download'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    }
  } catch (err) {
    console.error('Failed to download file:', err)
  }
}

export function openFileInNewTab(url, mimeType = '') {
  if (!url) return

  // If it's a standard web link, open directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  // Parse and convert Base64 to Blob URL
  try {
    const blob = base64ToBlob(url, mimeType)
    if (blob) {
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } else {
      window.open(url, '_blank')
    }
  } catch (e) {
    console.error('Failed to open base64 file via Blob, using iframe fallback:', e)
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${url}" frameborder="0" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;" allowfullscreen></iframe>`
      )
      newWindow.document.close()
    }
  }
}
