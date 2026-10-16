import { useAuth } from '@/auth/useAuth'
import { useEffect, useState } from 'react'
import type { DetectionSnapshot } from '@/types'
import { getDetectionSnapshot } from '@/services/detectionService'
import { getVisitorDetectionSnapshot } from '@/services/visitorService'

export function useDetection(cameraId: string) {
  const { user } = useAuth()
  const [snapshot, setSnapshot] = useState<DetectionSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let interval: number | undefined

    async function load(initial = false) {
      if (initial) setLoading(true)
      const next = user ? await getDetectionSnapshot(cameraId) : await getVisitorDetectionSnapshot(cameraId)
      if (!cancelled) {
        setSnapshot(next)
        if (initial) setLoading(false)
      }
    }

    if (cameraId) {
      void load(true)
      if (!user) interval = window.setInterval(() => void load(false), 6000)
    }

    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
    }
  }, [cameraId, user])

  return { snapshot, loading }
}
