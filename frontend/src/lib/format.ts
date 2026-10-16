/**
 * Small formatting helpers shared across components. Kept framework
 * agnostic so they work the same whether fed mock data or real API
 * responses.
 *
 * The backend returns timezone-aware ISO 8601 timestamps (PostgreSQL
 * `TIMESTAMPTZ` columns, serialized by Pydantic as e.g.
 * "2026-09-04T09:12:44+00:00"). `new Date(iso)` parses the offset
 * correctly and `toLocaleTimeString`/`toLocaleString` below render it in
 * the browser's local timezone — never treat these strings as if they
 * were already local time.
 *
 * Every function accepts `null | undefined` and returns a fallback
 * dash, since several backend fields are genuinely nullable (a camera
 * that has never connected has `last_connection_at: null`, an alert
 * with no linked camera has `camera_name: null`, etc.) — centralizing
 * that here means components never need their own null-check before
 * formatting a timestamp.
 */

const FALLBACK = '—'

export function formatClockTime(iso: string | null | undefined): string {
  if (!iso) return FALLBACK
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return FALLBACK
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return FALLBACK
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return FALLBACK
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return FALLBACK
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return FALLBACK
  const now = Date.now()
  const diffMs = now - then
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`

  const diffHr = Math.round(diffMin / 60)
  if (diffHr === 1) return '1 hour ago'
  if (diffHr < 24) return `${diffHr} hours ago`

  const diffDay = Math.round(diffHr / 24)
  if (diffDay === 1) return 'Yesterday'
  return `${diffDay} days ago`
}

export function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
