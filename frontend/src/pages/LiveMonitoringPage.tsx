import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCameras } from '@/hooks/useCameras'
import { useDetection } from '@/hooks/useDetection'
import { LivePlayer } from '@/components/live/LivePlayer'
import { CameraSwitcherList } from '@/components/live/CameraSwitcherList'
import { DetectionPanel } from '@/components/live/DetectionPanel'

export function LiveMonitoringPage() {
  const { cameraId } = useParams<{ cameraId?: string }>()
  const navigate = useNavigate()
  const { cameras, loading, error } = useCameras()
  const [activeCameraId, setActiveCameraId] = useState<string | undefined>(cameraId)

  useEffect(() => {
    if (cameraId) {
      setActiveCameraId(cameraId)
    } else if (!activeCameraId && cameras.length > 0) {
      setActiveCameraId(cameras[0].id)
    }
  }, [cameraId, cameras, activeCameraId])

  const { snapshot, loading: detectionLoading } = useDetection(activeCameraId ?? '')

  if (error) return <p role="alert">{error}</p>
  if (!loading && cameras.length === 0) return <p>No cameras added yet. Add your first camera to start monitoring.</p>
  if (loading || !activeCameraId) {
    return <p className="py-16 text-center text-[13px] text-ink-muted">Loading cameras…</p>
  }

  const activeCamera = cameras.find((c) => c.id === activeCameraId)
  if (!activeCamera) return <p>Camera not found.</p>

  function handleSelect(id: string) {
    setActiveCameraId(id)
    navigate(`/live/${id}`, { replace: true })
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_320px]">
      <LivePlayer camera={activeCamera}>
        <CameraSwitcherList cameras={cameras} activeCameraId={activeCameraId} onSelect={handleSelect} />
      </LivePlayer>
      <DetectionPanel snapshot={snapshot} loading={detectionLoading} />
    </div>
  )
}
