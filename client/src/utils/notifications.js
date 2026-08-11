import { formatDate } from './dateHelpers'

// Request permission for showing notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Fire a browser notification
export function showNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  // Register notification
  try {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
      })
    }).catch(() => {
      // Fallback if service worker is not active
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
      })
    })
  } catch {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
    })
  }
}

// Scheduled check for daily streaks & application deadlines
export function runNotificationScheduler(streakData, applications) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Streak reminder (fire at 8:00 PM if no activity today)
  const lastActive = streakData?.lastActiveDate
  if (lastActive !== todayStr) {
    const currentHour = new Date().getHours()
    // Fire evening reminder if user is inactive
    if (currentHour >= 19) {
      const lastKey = 'streak_notified_today'
      const notified = localStorage.getItem(lastKey)
      if (notified !== todayStr) {
        showNotification(
          'Streak Warning! 🔥',
          `Keep your ${streakData?.currentStreak || 0}-day preparation streak alive! Log a problem or topic now.`
        )
        localStorage.setItem(lastKey, todayStr)
      }
    }
  }

  // 2. Deadline alert (fire notification if interview/OA is within 24 hours)
  applications.forEach((app) => {
    if (!app.roundDate) return
    const d = app.roundDate.toDate ? app.roundDate.toDate() : new Date(app.roundDate)
    const diff = d.getTime() - Date.now()

    // 24 hours limit
    if (diff > 0 && diff <= 24 * 60 * 60 * 1000) {
      const appKey = `app_notified_${app.id}`
      const notified = localStorage.getItem(appKey)
      if (!notified) {
        showNotification(
          'Upcoming Round Reminder 🚀',
          `Your interview/OA round for ${app.companyName} (${app.role}) is scheduled for ${formatDate(app.roundDate)}!`
        )
        localStorage.setItem(appKey, 'true')
      }
    }
  })
}

// Trigger test notification for PWA/Browser verification
export function triggerTestNotification() {
  if (!('Notification' in window)) {
    alert('Browser notifications are not supported in this browser.')
    return false
  }
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        showNotification(
          'Placify Deadline Alert Active! 🚀',
          'PWA notifications are enabled. You will receive automated alerts for job drive deadlines and OA/Interview schedules.'
        )
      } else {
        alert('Notification permission denied. Please allow notifications in browser settings.')
      }
    })
  } else {
    showNotification(
      'Placify Deadline Alert Active! 🚀',
      'PWA notifications are enabled. You will receive automated alerts for job drive deadlines and OA/Interview schedules.'
    )
  }
}

// Generate email mailto link for sending deadline reminder to student's email/calendar
export function generateCalendarEmailUrl(app, userEmail) {
  const company = app.companyName || app.company || 'Target Company'
  const role = app.role || 'Placement Drive'
  const dateStr = app.roundDate ? formatDate(app.roundDate) : app.oaDate || 'Upcoming Date'
  const subject = encodeURIComponent(`[Placify Deadline Alert] ${company} - ${role}`)
  const body = encodeURIComponent(
    `Hi,\n\nThis is a reminder for your upcoming placement drive:\n\nCompany: ${company}\nRole: ${role}\nStatus: ${app.status || 'Applied'}\nScheduled Date: ${dateStr}\nLink: ${app.link || 'N/A'}\nNotes: ${app.notes || app.prepNotes || 'None'}\n\nDon't miss this opportunity!\n- Placify Placement Tracker`
  )
  return `mailto:${userEmail || ''}?subject=${subject}&body=${body}`
}
