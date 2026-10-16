import { useAuth } from '@/auth/useAuth'
import { useCallback, useEffect, useState } from 'react'
import type { Camera, CameraDraft, NvrChannelSelection } from '@/types'
import { createCamera, createNvrChannels, deleteCamera, getCameras } from '@/services/cameraService'
import {
  createTemporaryVisitorCamera,
  deleteTemporaryVisitorCamera,
  getVisitorCameras,
} from '@/services/visitorService'

export function useCameras() {
  const { user } = useAuth()
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    const request = user ? getCameras() : getVisitorCameras()
    return request
      .then(setCameras)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load cameras.'))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addCamera = useCallback(async (draft: CameraDraft) => {
    const camera = user ? await createCamera(draft) : await createTemporaryVisitorCamera(draft)
    setCameras((prev) => [camera, ...prev])
    return camera
  }, [user])

  const addNvrChannels = useCallback(async (draft: CameraDraft, channels: NvrChannelSelection[]) => {
    if (!user) throw new Error('Sign in to add real NVR channels.')
    const created = await createNvrChannels(draft, channels)
    setCameras((prev) => [...created, ...prev])
    return created
  }, [user])

  const removeCamera = useCallback(async (id: string) => {
    if (user) await deleteCamera(id)
    else await deleteTemporaryVisitorCamera(id)
    setCameras((prev) => prev.filter((c) => c.id !== id))
  }, [user])

  return {
    cameras,
    loading,
    error,
    refresh,
    addCamera,
    addNvrChannels,
    removeCamera,
    visitorMode: !user,
  }
}
