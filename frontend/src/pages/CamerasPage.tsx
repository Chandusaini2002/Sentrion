import { useState } from 'react'
import { Plus, Video } from 'lucide-react'
import { useCameras } from '@/hooks/useCameras'
import { CameraTable } from '@/components/cameras/CameraTable'
import { AddCameraModal } from '@/components/cameras/AddCameraModal'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'

export function CamerasPage() {
  const {
    cameras,
    loading,
    error,
    refresh,
    addCamera,
    addNvrChannels,
    removeCamera,
    visitorMode,
  } = useCameras()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-ink-muted">
            {loading ? 'Loading cameras…' : `${cameras.length} registered ${cameras.length === 1 ? 'camera' : 'cameras'}`}
          </p>
          {visitorMode && (
            <p className="mt-1 text-[11.5px] text-ink-muted">
              Cameras you add as a visitor stay only for this browser session.
            </p>
          )}
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          Add camera
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : !loading && cameras.length === 0 ? (
        <EmptyState
          icon={<Video size={22} />}
          title="No cameras connected"
          description="Add your first security camera or NVR channels to begin monitoring."
          action={
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
              Add camera
            </Button>
          }
        />
      ) : (
        <CameraTable cameras={cameras} onDelete={removeCamera} onRefresh={refresh} visitorMode={visitorMode} />
      )}

      <AddCameraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addCamera}
        onSaveNvrChannels={addNvrChannels}
        visitorMode={visitorMode}
      />
    </div>
  )
}
