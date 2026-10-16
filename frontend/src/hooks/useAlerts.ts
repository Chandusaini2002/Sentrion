import { useAuth } from '@/auth/useAuth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AlertFilter, SecurityAlert } from '@/types'
import { getAlerts, resolveAlert } from '@/services/alertService'
import { getVisitorAlerts } from '@/services/visitorService'

export function useAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<AlertFilter>('all')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let interval: number | undefined

    async function load(initial = false) {
      if (initial) setLoading(true)
      setError(null)
      try {
        const next = user ? await getAlerts() : await getVisitorAlerts()
        if (!cancelled) setAlerts(next)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load alerts.')
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

  const resolve = useCallback(async (id: string) => {
    if (!user) return
    const updated = await resolveAlert(id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
  }, [user])

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts
    return alerts.filter((a) => a.severity === filter || a.status === filter)
  }, [alerts, filter])

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    loading,
    error,
    filter,
    setFilter,
    resolve,
    refetch,
    readOnly: !user,
  }
}
