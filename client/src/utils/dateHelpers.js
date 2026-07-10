export function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(date) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24))
}

export function daysAgo(date) {
  if (!date) return null
  const d = date?.toDate ? date.toDate() : new Date(date)
  return daysBetween(d, new Date())
}

export function isToday(dateStr) {
  return dateStr === getTodayString()
}

export function isYesterday(dateStr) {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return dateStr === y.toISOString().split('T')[0]
}

export function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export function startOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isWithinHours(date, hours) {
  if (!date) return false
  const d = date?.toDate ? date.toDate() : new Date(date)
  const diff = d.getTime() - Date.now()
  return diff > 0 && diff <= hours * 60 * 60 * 1000
}

export function getNextReviewDate(confidence) {
  const days = confidence === 'Red' ? 1 : confidence === 'Yellow' ? 3 : 7
  return addDays(days)
}
