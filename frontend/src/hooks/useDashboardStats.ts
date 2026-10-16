import { useAuth } from '@/auth/useAuth'
import { useCallback, useEffect, useState } from 'react'
import type { Camera, SecurityEvent } from '@/types'
import { getDashboardStats, type DashboardStats } from '@/services/dashboardService'
import { getCameras } from '@/services/cameraService'
import { getSecurityEvents } from '@/services/securityEventService'
import {
  getVisitorCameras,
  getVisitorDashboardStats,
  getVisitorSecurityEvents,
} from '@/services/visitorService'

const emptyStats: DashboardStats = {
  totalCameras: 0,
  camerasOnline: 0,
  camerasOffline: 0,
  activeAlerts: 0,
  peopleDetected: 0,
  securityEvents: 0,
}

export function useDashboardStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
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
        const [s, c, e] = user
          ? await Promise.all([getDashboardStats(), getCameras(), getSecurityEvents(5)])
          : await Promise.all([getVisitorDashboardStats(), getVisitorCameras(), getVisitorSecurityEvents(5)])
        if (!cancelled) {
          setStats(s)
          setCameras(c)
          setEvents(e)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
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

  return { stats, cameras, events, loading, error, refetch }
}
