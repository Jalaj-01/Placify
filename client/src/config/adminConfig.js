/**
 * Admin Configuration & Super-Admin Registry
 */

export const SUPER_ADMIN_EMAILS = [
  'jalajgupta550@gmail.com',
  'jalaj.gupta25m@iiitg.ac.in',
]

/**
 * Check whether an email is a super-admin.
 * Case-insensitive, trimmed comparison.
 */
export function isSuperAdmin(email) {
  if (!email || typeof email !== 'string') return false
  const clean = email.toLowerCase().trim()
  return SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === clean)
}

/**
 * Available platform roles
 */
export const PLATFORM_ROLES = [
  { id: 'student', label: 'Student', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'teacher', label: 'Teacher / Faculty', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'phd', label: 'PhD Scholar', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'admin', label: 'Administrator', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
]
