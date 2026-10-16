import { useCallback, useEffect, useState } from 'react'
import type { ActivityLogEntry } from '@/types'
import { getActivityLog } from '@/services/activityService'

export function useActivity() {
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getActivityLog()
      .then(setActivity)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [reloadKey])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  return { activity, loading, error, refetch }
}
