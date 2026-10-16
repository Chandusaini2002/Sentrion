import { useEffect, useRef, useState } from 'react'
import { Bell, RefreshCw } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatRelativeTime } from '@/lib/format'

const severityDot: Record<string, string> = {
  critical: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-accent',
}

export function NotificationsDropdown() {
  const { notifications, unreadCount, loading, error, refetch, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface-2 text-ink-secondary hover:border-border-strong hover:text-ink-primary"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute right-[7px] top-[6px] h-[7px] w-[7px] rounded-full border-[1.5px] border-surface-1 bg-danger" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-md border border-border-strong bg-surface-1 shadow-modal">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[13px] font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="font-mono text-[11px] text-ink-muted">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-[12.5px] text-ink-muted">Loading…</p>
            )}
            {!loading && error && (
              <div className="flex flex-col items-center gap-2.5 px-4 py-6 text-center">
                <p className="text-[12.5px] text-danger-text">{error}</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-text hover:underline"
                >
                  <RefreshCw size={12} />
                  Try again
                </button>
              </div>
            )}
            {!loading && !error && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-[12.5px] text-ink-muted">
                You're all caught up.
              </p>
            )}
            {!loading &&
              !error &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-2 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 h-[6px] w-[6px] flex-shrink-0 rounded-full ${
                      severityDot[n.severity ?? 'info']
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium">{n.title}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">{n.message}</span>
                    <span className="mt-1 block font-mono text-[10.5px] text-ink-muted">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
