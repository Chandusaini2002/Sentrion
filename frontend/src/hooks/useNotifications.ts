import { useAuth } from '@/auth/useAuth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppNotification } from '@/types'
import { getNotifications, markNotificationRead } from '@/services/notificationService'
import { getVisitorNotifications } from '@/services/visitorService'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let interval: number | undefined

    async function load(initial = false) {
      if (initial) setLoading(true)
      setError(null)
      try {
        const next = user ? await getNotifications() : await getVisitorNotifications()
        if (!cancelled) setNotifications(next)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load notifications.')
      } finally {
        if (!cancelled && initial) setLoading(false)
      }
    }

    void load(true)
    if (!user) interval = window.setInterval(() => void load(false), 8000)

    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
    }
  }, [reloadKey, user])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    if (user) await markNotificationRead(id)
  }, [user])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  return { notifications, unreadCount, loading, error, refetch, markRead }
}
